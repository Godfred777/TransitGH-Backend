import { Module } from '@nestjs/common';
import { TransitService } from './transit.service';
import { TransitController } from './transit.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TransitService, PrismaService],
  controllers: [TransitController]
})
export class TransitModule {}
