import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateStopDto {
  name: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class StopsService {
  constructor(private prisma: PrismaService) {}

  async createStop(dto: CreateStopDto) {
    // 1. Validate Coordinates (Basic check)
    if (dto.latitude < -90 || dto.latitude > 90) {
      throw new BadRequestException('Invalid Latitude');
    }
    if (dto.longitude < -180 || dto.longitude > 180) {
      throw new BadRequestException('Invalid Longitude');
    }

    // 2. Create the Stop
    return this.prisma.stop.create({
      data: {
        name: dto.name,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async getAllStops() {
    return this.prisma.stop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async updateStopLocation(id: number, lat: number, long: number) {
    return this.prisma.stop.update({
      where: { id },
      data: { latitude: lat, longitude: long },
    });
  }
}