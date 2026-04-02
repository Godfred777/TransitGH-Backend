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

  // Passenger: Find nearest stops to their location
  @Get('nearest-stops')
  async nearestStops(
    @Query('lat') lat: number,
    @Query('long') long: number,
    @Query('radius') radius: number = 1000, // default 1km
  ) {
    return this.transitService.findNearestStops(lat, long, radius);
  }

  //Admin/Driver: Add a stop to a route
  @Post('add-stop-to-route')
  async addStopToRoute(
    @Query('routeId', ParseIntPipe) routeId: number,
    @Query('stopId', ParseIntPipe) stopId: number,
    @Query('sequence', ParseIntPipe) sequence: number,
    @Query('durationFromStart', ParseIntPipe) durationFromStart: number,
  ) {
    return this.transitService.addStopToRoute(routeId, stopId, sequence, durationFromStart);
  } 

}
