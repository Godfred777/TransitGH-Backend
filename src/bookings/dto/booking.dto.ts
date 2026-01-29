import { IsString, IsNumber } from "class-validator";

export class CreateBookingDto {
    @IsString()
    tripId: number;

    @IsString()
    seatNumber: number;

    @IsNumber()
    pickupSeq: number;

    @IsNumber()
    dropoffSeq: number;

    @IsNumber()
    pickupStopId: number;

    @IsNumber()
    dropoffStopId: number;

    @IsNumber()
    routeId: number;

}