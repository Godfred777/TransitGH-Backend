import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';


@Injectable()
export class BookingsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.booking.findMany()
    }

    async findAllByUserId(userId: number) {
        return this.prisma.booking.findMany({
            where: {
                userId,
            },
        });
    }

    async findOne(id: number) {
        return this.prisma.booking.findUnique({
            where: {
                id,
            },
        });
    }

    async create(data: Prisma.BookingCreateInput) {
        return this.prisma.booking.create({
            data,
        });
    }

    async update(id: number, data: Partial<Prisma.BookingUpdateInput>) {
        return this.prisma.booking.update({
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: number) {
        return this.prisma.booking.delete({
            where: {
                id,
            },
        });
    }
}
