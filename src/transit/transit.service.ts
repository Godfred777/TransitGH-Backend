import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stop } from 'generated/prisma/client';

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
    maxDistanceMeters: number = 1000
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
}
