import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @IsInt()
  @Min(1)
  pricePerDay!: number;
}