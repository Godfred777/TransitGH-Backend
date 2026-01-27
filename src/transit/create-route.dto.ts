import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class RouteStopDto {
  @IsInt()
  stopId: number;

  @IsInt()
  @Min(0)
  durationFromStart: number; // e.g., 0 mins for start, 15 mins for next stop
}

export class CreateRouteDto {
  @IsString()
  name: string; // e.g., "Dodowa - Accra (Morning Express)"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[]; // The ordered list: [Dodowa ID, Oyibi ID, Adenta ID...]
}

export class UpdateRouteDto extends CreateRouteDto {}