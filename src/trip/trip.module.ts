import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TripService, PrismaService],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
