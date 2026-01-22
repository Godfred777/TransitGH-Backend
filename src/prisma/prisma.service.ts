import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg'

@Injectable()
export class PrismaService {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const prismaPg = new PrismaPg({connectionString});
        const prisma = new PrismaClient({
            adapter: prismaPg,
        });
    }
}
