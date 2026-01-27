import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stop } from 'generated/prisma/client';
import { CreateRouteDto } from './dto/create-route.dto';

// Define the NearestStopResult interface
export interface NearestStopResult extends Stop {
  distance_meters: number;
}
@Injectable()
export class TransitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds bus stops within a certain radius of the user.
   * @param userLat User's Latitude
   * @param userLong User's Longitude
   * @param maxDistanceMeters (Optional) Default 1000m (1km)
   */
  async findNearestStops(
    userLat: number,
    userLong: number,
    maxDistanceMeters: number = 1000,
  ): Promise<NearestStopResult[]> {
    // We use Prisma's $queryRaw to execute direct SQL.
    // NOTE: In PostGIS, the order is always (Longitude, Latitude) -> (X, Y)
    const stops = await this.prisma.$queryRaw<NearestStopResult[]>`
      SELECT 
        id, 
        name, 
        latitude, 
        longitude,
        -- Calculate distance between Stop location and User location
        ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
          ST_SetSRID(ST_MakePoint(${userLong}, ${userLat}), 4326)
        ) as distance_meters
      FROM "Stop"
      WHERE 
        ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
          ST_SetSRID(ST_MakePoint(${userLong}, ${userLat}), 4326)
        ) <= ${maxDistanceMeters}
      ORDER BY distance_meters ASC
      LIMIT 10;
    `;

    // Note: The result from raw queries might have bigints or specific types
    // depending on the driver, but typically this maps cleanly to JSON.
    return stops;
  }

  async createRoute(dto: CreateRouteDto) {
    // We use a transaction to ensure we don't get a "half-created" route if something fails
    return this.prisma.$transaction(async (tx) => {
      // Step A: Create the Route parent
      const route = await tx.route.create({
        data: {
          name: dto.name,
        },
      });

      // Step B: Create the RouteStops with explicit sequence numbers
      // We map the input array index (0, 1, 2) to the 'sequence' column
      const stopPromises = dto.stops.map((stopDto, index) =>
        tx.routeStop.create({
          data: {
            routeId: route.id,
            stopId: stopDto.stopId,
            sequence: index + 1, // 1-based sequence (Dodowa=1, Oyibi=2)
            estTimeFromStart: stopDto.durationFromStart,
          },
        }),
      );

      await Promise.all(stopPromises);

      return route;
    });
  }

  /**
   * 2. PASSENGER FEATURE: Find routes between two points
   * Returns routes where Pickup Sequence < Dropoff Sequence
   */
  async findRoutesBetweenStops(pickupStopId: number, dropoffStopId: number) {
    // We use raw SQL here because comparing two rows in the SAME table (RouteStop)
    // is very difficult/slow with standard Prisma syntax.
    
    const validRoutes = await this.prisma.$queryRaw`
      SELECT 
        r.id as "routeId",
        r.name as "routeName",
        start_rs.sequence as "pickupSeq",
        end_rs.sequence as "dropoffSeq",
        (end_rs."estTimeFromStart" - start_rs."estTimeFromStart") as "estDurationMins"
      FROM "Route" r
      -- Join to find the Pickup Stop record
      INNER JOIN "RouteStop" start_rs 
        ON r.id = start_rs."routeId" 
        AND start_rs."stopId" = ${pickupStopId}
      -- Join to find the Dropoff Stop record
      INNER JOIN "RouteStop" end_rs 
        ON r.id = end_rs."routeId" 
        AND end_rs."stopId" = ${dropoffStopId}
      -- THE GOLDEN RULE: Pickup must be before Dropoff
      WHERE start_rs.sequence < end_rs.sequence
    `;

    return validRoutes;
  }
}
