import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './tracking.service'; // Our Turf.js service
//import { TripService } from 'src/trip/trip.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'tracking',
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private trackingService: TrackingService,
    //private tripService: TripService,
    private prisma: PrismaService,
  ) {}

  // When a passenger or mate opens the map
  @SubscribeMessage('join_trip')
  handleJoinRoom(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`trip_${data.tripId}`);
    console.log(`User joined trip room: ${data.tripId}`);
  }

  // The "Pulse": Mate sends GPS coordinates
  @SubscribeMessage('send_location')
  async handleLocationUpdate(
    @MessageBody() data: { tripId: number; lat: number; lng: number },
  ) {
    const { tripId, lat, lng } = data;

    // 1. Get the stop we are expecting the bus to hit next
    const nextStop = await this.trackingService.getNextStopForTrip(tripId);

    if (nextStop) {
      // 2. Use Turf.js to check if we are within 50 meters of that stop
      const hasArrived = this.trackingService.checkArrivalStatus(
        lat,
        lng,
        nextStop.latitude,
        nextStop.longitude,
      );

      if (hasArrived) {
        // 3. Update the Trip record to say we've passed this stop
        // This "bumps" the sequence so the next ping looks for the NEXT stop
        await this.prisma.trip.update({
          where: { id: tripId },
          data: { lastStopSequence: { increment: 1 } },
        });

        // 4. Notify Sarah and other passengers
        this.server.to(`trip_${tripId}`).emit('announcement', {
          type: 'ARRIVAL',
          message: `Bus has arrived at ${nextStop.name}`,
          stopId: nextStop.id,
        });
      }
    }

    // Always broadcast the raw coordinates so the icon moves on the map
    this.server.to(`trip_${tripId}`).emit('location_received', { lat, lng });
  }
}