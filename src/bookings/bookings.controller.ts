import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards';
import { RolesGuard, Roles } from 'src/auth/roles.guard';
import { Role } from 'generated/prisma/client';
//import { PrismaService } from 'src/prisma/prisma.service';


@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async findAll() {
        return this.bookingsService.findAll();
    }

    @Get('bookings/:userId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.PASSENGER)
    async findAllByUserId(@Param('userId') userId: number) {
        return this.bookingsService.findAllByUserId(userId);
    }

    @Post('booking')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.PASSENGER)
    async create(@Body() data: any) {
        return this.bookingsService.create(data);
    }

    @Get('booking/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.PASSENGER)
    async findOne(@Param('id') id: number) {
        return this.bookingsService.findOne(id);
    }

    @Patch('booking/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.PASSENGER)
    async update(@Param('id') id: number,  @Body() data: any) {
        return this.bookingsService.update(id, data);
    }

    @Delete('booking/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.PASSENGER)
    async delete(@Param('id') id: number) {
        return this.bookingsService.delete(id);
    }
}
