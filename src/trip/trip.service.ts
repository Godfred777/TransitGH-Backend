import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripService {

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getNextStopForTrip(tripId: number) {
    // 1. Get the trip and its current status
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: {
            stops: {
              orderBy: { sequence: 'asc' },
              include: { stop: true }
            }
          }
        }
      }
    });

    if (!trip) throw new Error('Trip not found');

    // 2. Determine which stop is "Next"
    // If the trip just started (BOARDING), the next stop is the first stop (Seq 1).
    if (trip.status === 'BOARDING') {
      return trip.route.stops[0].stop;
    }

    /* 3. Logic: Find the first stop where the bus hasn't arrived yet.
       We track this using a 'lastStopSequence' column in the Trip table.
       You should update this sequence number whenever an "Arrival" is triggered.
    */
    const lastSequence = trip.lastStopSequence || 0;
    const nextRouteStop = trip.route.stops.find(rs => rs.sequence > lastSequence);

    return nextRouteStop ? nextRouteStop.stop : null;
  }

  /**
   * Marks the trip as COMPLETED and records the end time.
   */
  async completeTrip(tripId: number) {
    return this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        // You might want to add an 'endTime' field to your schema later
        // endTime: new Date(), 
      },
    });
  }

  /**
   * Helper to get the total number of stops in the route.
   * Useful to check if we are at the end.
   */
  async getRouteStopCount(routeId: number): Promise<number> {
    return this.prisma.routeStop.count({
      where: { routeId },
    });
  }
}
