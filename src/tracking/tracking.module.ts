import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';

@Module({
  providers: [TrackingService, TrackingGateway]
})
export class TrackingModule {}
