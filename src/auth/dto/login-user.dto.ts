import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}