import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(phone: string, password: string) {

        if (!phone || !password) {
            throw new BadRequestException('Invalid credentials');
        }

        else {
            const user = await this.usersService.findByPhone(phone);
            if (user && (bcrypt.compare(password, user.password))) {
                const { password, ...result } = user;
                return result;
            }
            else {
                throw new UnauthorizedException('Invalid credentials');
            }     
        }
    }

    async register(userData: Prisma.UserCreateInput) {
        const existingUser = await this.usersService.findByPhone(userData.phone);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = await this.usersService.create({
            ...userData,
            password: hashedPassword,
        });
        const { password, ...result } = newUser;
        return result;
    }

    async login(user: any) {
        const foundUser = await this.validateUser(user.phone, user.password);
        if (!foundUser) {
            throw new UnauthorizedException();
        }
        const payload = { phone: user.phone, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
