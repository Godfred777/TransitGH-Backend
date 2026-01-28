import { Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import { StopsService } from './stops.service';

@Controller('stops')
export class StopsController {
    constructor(private readonly stopsService: StopsService) {}

    @Post()
    async create(@Body() data: any) {
        return this.stopsService.createStop(data);
    }

    @Get()
    async findAll() {
        return this.stopsService.getAllStops();
    }

    @Patch(':id/location')
    async updateLocation(
        @Param('id') id: number,
        @Body('latitude') latitude: number,
        @Body('longitude') longitude: number,
    ) {
        return this.stopsService.updateStopLocation(id, latitude, longitude);
    }
}
