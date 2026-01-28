import { IsString, IsNumber } from "class-validator";

export class CreateVehicleDto {
    @IsString()
    plateNumber: string;

    @IsString()
    model: string;

    @IsNumber()
    capacity: number;

    @IsNumber()
    ownerId: number;

    @IsString()
    color: string;

}