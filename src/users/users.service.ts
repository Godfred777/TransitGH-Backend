import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../interfaces/users.interfaces';


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

    async create(data: User) {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: number, data: Partial<User>) {
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
}
