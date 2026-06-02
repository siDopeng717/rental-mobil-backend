import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
  @ApiProperty({
    example: 'Avanza',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'N 1234 AB',
  })
  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @ApiProperty({
    example: 300000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricePerDay!: number;
}