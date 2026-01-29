import { Module } from '@nestjs/common';
import { FaresService } from './fares.service';
import { FaresController } from './fares.controller';

@Module({
  providers: [FaresService],
  controllers: [FaresController]
})
export class FaresModule {}
