import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [TripModule],
  controllers: [],
  providers: [TrackingService, TrackingGateway, PrismaService],
})
export class TrackingModule {}
