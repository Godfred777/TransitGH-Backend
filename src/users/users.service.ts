import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany()
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async create(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: number, data: Partial<Prisma.UserUpdateInput>) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }

    async delete(id: number) {
        return this.prisma.user.delete({
            where: {
                id,
            },
        });
    }

    async findByPhone(phone: string) {
        return this.prisma.user.findUnique({
            where: {
                phone,
            },
        });
    }
}
