// create-car.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricePerDay!: number;
}