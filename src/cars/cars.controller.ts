import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CarsService } from './cars.service';

import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cars')
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
  ) {}

  @Get()
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(
      Number(id),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileInterceptor('file'),
  )
  create(
    @Body() body: CreateCarDto,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.carsService.create(
      body,
      file,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  update(
    @Param('id') id: string,

    @Body() body: UpdateCarDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.carsService.update(
      Number(id),
      body,
      file,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
  ) {
    return this.carsService.deactivate(
      Number(id),
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
  ) {
    return this.carsService.activate(
      Number(id),
    );
  }
}