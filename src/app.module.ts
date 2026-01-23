import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from "@nestjs/config";
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({
    isGlobal: true,
  }), BookingsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
