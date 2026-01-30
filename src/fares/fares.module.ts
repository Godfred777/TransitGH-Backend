import { Module } from '@nestjs/common';
import { FareService } from './fares.service';
import { FareController } from './fares.controller';
import {PrismaService} from 'src/prisma/prisma.service';

@Module({
  providers: [FareService, PrismaService],
  controllers: [FareController]
})
export class FaresModule {}
