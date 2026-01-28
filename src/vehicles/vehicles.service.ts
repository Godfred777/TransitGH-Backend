import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import { Prisma } from 'generated/prisma/client';


interface CreateVehicleInterface {
    plateNumber: string;
    capacity: number;
    model: string;
    ownerId: number;
}


@Injectable()
export class VehiclesService {
    constructor(private prisma: PrismaService) {}

    async getAllVehicles() {
        return this.prisma.vehicle.findMany();
    }

    async getVehicleById(id: number) {
        return this.prisma.vehicle.findUnique({
            where: { id },
        });
    }

    async createVehicle(data: CreateVehicleInterface) {
        const { ownerId, ...vehicleData } = data;

        if (ownerId) {
            const ownerExists = await this.prisma.user.findUnique({
                where: { id: ownerId },
            });

            if (!ownerExists) {
                throw new Error('Owner does not exist');
            }
        } else {
            throw new Error('Owner ID is required');
        }


        return this.prisma.vehicle.create({
            data: {
                ...vehicleData,
                owner: {
                    connect: { id: ownerId },
                },
            },
        });
    }

    async updateVehicle(id: number, data: Prisma.VehicleUpdateInput) {
        return this.prisma.vehicle.update({
            where: { id },
            data,
        });
    }

    async deleteVehicle(id: number) {
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }

    async getVehiclesByOwnerId(ownerId: number) {
        return this.prisma.vehicle.findMany({
            where: { ownerId },
        });
    }

    async getVehiclesByPlateNumber(plateNumber: string) {
        return this.prisma.vehicle.findMany({
            where: { plateNumber },
        });
    }

    async getVehiclesByTripId(tripId: number) {
        return this.prisma.vehicle.findMany({
            where: { trips: { some: { id: tripId } } },
        });
    }
}
