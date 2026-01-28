import { Module } from '@nestjs/common';
import { StopsController } from './stops.controller';
import { StopsService } from './stops.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StopsController],
  providers: [StopsService, PrismaService],
})
export class StopsModule {}
