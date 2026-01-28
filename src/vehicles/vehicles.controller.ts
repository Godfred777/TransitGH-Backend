import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) {}

    @Get()
    @HttpCode(200)
    getAllVehicles() {
        return this.vehiclesService.getAllVehicles();
    }

    @Get(':id')
    @HttpCode(200)
    getVehicleById(@Param('id') id: string) {
        return this.vehiclesService.getVehicleById(Number(id));
    }

    @Post()
    @HttpCode(201)
    createVehicle(@Body() data: CreateVehicleDto) {
        return this.vehiclesService.createVehicle(data);
    }

    @Patch(':id')
    @HttpCode(202)
    updateVehicle(@Param('id') id: string, @Body() data: any) {
        return this.vehiclesService.updateVehicle(Number(id), data);
    }

    @Delete(':id')
    @HttpCode(204)
    deleteVehicle(@Param('id') id: string) {
        return this.vehiclesService.deleteVehicle(Number(id));
    }

    @Get('by-owner')
    @HttpCode(200)
    getVehiclesByOwnerId(@Query('ownerId') ownerId: string) {
        return this.vehiclesService.getVehiclesByOwnerId(Number(ownerId));
    }

    @Get('by-plate')
    @HttpCode(200)
    getVehiclesByPlateNumber(@Query('plateNumber') plateNumber: string) {
        return this.vehiclesService.getVehiclesByPlateNumber(plateNumber);
    }

    @Get('by-trip')
    @HttpCode(200)
    getVehiclesByTripId(@Query('tripId') tripId: string) {
        return this.vehiclesService.getVehiclesByTripId(Number(tripId));
    }

}
