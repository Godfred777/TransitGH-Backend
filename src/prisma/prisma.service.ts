import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg'

@Injectable()
export class PrismaService extends PrismaClient{
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({connectionString});

        super({adapter});
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Connected to the database:', process.env.DATABASE_URL);
    }

}
