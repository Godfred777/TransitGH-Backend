
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
