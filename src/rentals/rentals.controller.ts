import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Controller('rentals')
export class RentalsController {
  constructor(
    private readonly rentalsService: RentalsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: any,
    @Body() body: CreateRentalDto,
  ) {
    return this.rentalsService.create(
      req.user.userId,
      body,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  findMyRentals(@Request() req: any) {
    return this.rentalsService.findMyRentals(
      req.user.userId,
    );
  }
}