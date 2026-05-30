import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';

import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() body: CreateRentalDto) {
    return this.rentalsService.create(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  findMyRentals(@Request() req: any) {
    return this.rentalsService.findMyRentals(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.rentalsService.cancelRental(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAllRentals() {
    return this.rentalsService.findAllRentals();
  }
}
