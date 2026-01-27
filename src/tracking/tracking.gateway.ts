import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './tracking.service'; // Our Turf.js service

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'tracking',
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private trackingService: TrackingService) {}

  // When a passenger or mate opens the map
  @SubscribeMessage('join_trip')
  handleJoinRoom(@MessageBody() data: { tripId: string }, @ConnectedSocket() client: Socket) {
    client.join(`trip_${data.tripId}`);
    console.log(`User joined trip room: ${data.tripId}`);
  }

// The "Pulse": Mate sends GPS coordinates
@SubscribeMessage('send_location')
async handleLocationUpdate(
  @MessageBody() data: { tripId: string; lat: number; lng: number },
) {
  const { tripId, lat, lng } = data;

  // 1. Broadcast the movement to everyone in the room (Passengers' maps move)
  this.server.to(`trip_${tripId}`).emit('location_received', { lat, lng, timestamp: new Date() });

  // 2. LOGIC CHECK: Is the bus near a stop? 
  const nextStop = await this.trackingService.getNextStopForTrip(parseInt(tripId));

  if (!nextStop) {
    return;
  }

  const hasArrived = this.trackingService.checkArrivalStatus(
    lat,
    lng,
    nextStop.latitude,
    nextStop.longitude,
  );

  if (hasArrived) {
    // Update the DB status for that specific stop segment
    // Notify passengers "Get your bags ready!"
    this.server.to(`trip_${tripId}`).emit('stop_arrival', {
      stopName: nextStop.name,
      stopId: nextStop.id,
    });
  }
  
  }


}