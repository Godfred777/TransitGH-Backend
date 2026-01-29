import { IsNumber, IsPositive, IsInt } from "class-validator";

export class UpdateFareDto {
  @IsNumber()
  @IsPositive()
  price: number;
}