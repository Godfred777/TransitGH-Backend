import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateFareDto {
  @IsInt()
  routeId: number;

  @IsInt()
  fromStopId: number;

  @IsInt()
  toStopId: number;

  @IsNumber()
  @IsPositive()
  price: number;
}
