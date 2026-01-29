import { Controller, Post, Patch, Body, Param, ParseIntPipe, Get } from '@nestjs/common';
import { FareService } from './fares.service';
import { CreateFareDto } from './dto/create-fares.dto';
import { UpdateFareDto } from './dto/update-fares.dto';

@Controller('fares')
export class FareController {
  constructor(private readonly fareService: FareService) {}

  // POST /fares
  @Post()
  create(@Body() dto: CreateFareDto) {
    // I recommend using upsert here by default for better DX
    return this.fareService.upsertFare(dto);
  }

  // GET /fares/route/1
  @Get('route/:id')
  getByRoute(@Param('id', ParseIntPipe) routeId: number) {
    return this.fareService.getFaresByRoute(routeId);
  }

  // PATCH /fares/1
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFareDto) {
    return this.fareService.updateFare(id, dto);
  }

  // Add to Controller
  @Post('bulk')
  async createBulk(@Body() fares: CreateFareDto[]) {
    // Use Promise.all to run them in parallel
    const promises = fares.map((fare) => this.fareService.upsertFare(fare));
    return Promise.all(promises);
  }
}