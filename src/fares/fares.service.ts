import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFareDto } from './dto/create-fares.dto';
import { UpdateFareDto } from './dto/update-fares.dto';


@Injectable()
export class FareService {
  constructor(private prisma: PrismaService) {}

  async calculateFare(routeId: number, fromStopId: number, toStopId: number): Promise<number> {
    const fare = await this.prisma.fare.findUnique({
      where: {
        routeId_fromStopId_toStopId: {
          routeId,
          fromStopId,
          toStopId,
        },
      },
    });

    if (!fare) {
      // Fallback logic could go here (e.g. calculate based on distance?), 
      // but for now, we enforce explicit pricing.
      throw new NotFoundException('Fare not defined for this segment');
    }

    return fare.price;
  }

  /**
   * 1. Create a single fare Rule
   * Throws error if this specific origin-destination pair already exists for the route.
   */
  async createFare(dto: CreateFareDto) {
    // Optional: Validate that fromStop and toStop actually exist on this Route
    // (Skipped for speed, but recommended for production)

    try {
      return await this.prisma.fare.create({
        data: {
          routeId: dto.routeId,
          fromStopId: dto.fromStopId,
          toStopId: dto.toStopId,
          price: dto.price,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint violation code
        throw new ConflictException('Fare for this specific stop-pair already exists.');
      }
      throw error;
    }
  }

  /**
   * 2. Update an existing fare price by ID
   */
  async updateFare(fareId: number, dto: UpdateFareDto) {
    try {
      return await this.prisma.fare.update({
        where: { id: fareId },
        data: { price: dto.price },
      });
    } catch (error) {
      throw new NotFoundException(`Fare with ID ${fareId} not found`);
    }
  }

  /**
   * 3. UPSERT (The Smart Way)
   * If the rule exists, update price. If not, create it.
   * Great for bulk uploading via CSV.
   */
  async upsertFare(dto: CreateFareDto) {
    return this.prisma.fare.upsert({
      where: {
        routeId_fromStopId_toStopId: {
          routeId: dto.routeId,
          fromStopId: dto.fromStopId,
          toStopId: dto.toStopId,
        },
      },
      update: {
        price: dto.price,
      },
      create: {
        routeId: dto.routeId,
        fromStopId: dto.fromStopId,
        toStopId: dto.toStopId,
        price: dto.price,
      },
    });
  }
  
  /**
   * 4. Get all fares for a route (Admin View)
   */
  async getFaresByRoute(routeId: number) {
    return this.prisma.fare.findMany({
      where: { routeId },
      include: {
        fromStop: true,
        toStop: true
      },
      orderBy: { fromStopId: 'asc' }
    });
  }
}