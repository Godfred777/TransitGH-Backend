import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { TripService } from './trip.service';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Trip } from 'generated/prisma/client';
import { TripStatus } from 'generated/prisma/client';

@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly prisma: PrismaService,
) {}

  // 1. Start a trip: Samuel starts his day
  @Post('start')
  async startTrip(@Body() body: { routeId: number; vehicleId: number; driverId: number }) {
    // This creates the trip and returns the 'tripId' the Mate's phone will use for GPS pings
    return this.tripService.startTripBroadcast(body.routeId, body.vehicleId, body.driverId);
  }

  // 2. Change status: e.g., BOARDING -> EN_ROUTE
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TripStatus) {
    return this.tripService.updateTripStatus(+id, status);
  }

  // 3. Passenger Search: Sarah sees which buses are moving
  @Get('active')
  async getActiveTrips() {
    return this.prisma.trip.findMany({
      where: { status: { in: ['BOARDING', 'IN_TRANSIT'] } },
      include: { route: true, vehicle: true }
    });
  }
}