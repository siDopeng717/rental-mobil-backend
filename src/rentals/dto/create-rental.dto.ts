import { IsDateString, IsInt } from 'class-validator';

export class CreateRentalDto {
  @IsInt()
  carId!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}