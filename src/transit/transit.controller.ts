import { Controller, Post, Get, Body, Query, ParseIntPipe } from '@nestjs/common';
import { TransitService } from './transit.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Controller('routes')
export class TransitController {
  constructor(private readonly transitService: TransitService) {}

  // Admin/Driver: Create a Route
  @Post()
  async create(@Body() createRouteDto: CreateRouteDto) {
    return this.transitService.createRoute(createRouteDto);
  }

  // Passenger: Search "Dodowa" (ID: 1) to "Madina" (ID: 5)
  @Get('search')
  async search(
    @Query('from', ParseIntPipe) fromId: number,
    @Query('to', ParseIntPipe) toId: number,
  ) {
    return this.transitService.findRoutesBetweenStops(fromId, toId);
  }
}