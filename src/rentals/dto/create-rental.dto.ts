import {
  IsDateString,
  IsInt,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRentalDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  carId!: number;

  @ApiProperty({
    example: '2026-06-10',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-06-12',
  })
  @IsDateString()
  endDate!: string;
}