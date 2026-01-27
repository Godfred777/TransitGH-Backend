import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  providers: [BookingsService, PrismaService, ScheduleModule],
  controllers: [BookingsController]
})
export class BookingsModule {}
