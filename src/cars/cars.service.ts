import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.car.findMany();
  }

  async findOne(id: number) {
    const car = await this.prisma.car.findUnique({
      where: {
        id,
      },
    });

    if (!car) {
      throw new NotFoundException(
        'Car not found',
      );
    }

    return car;
  }

  async create(data: CreateCarDto) {
    return this.prisma.car.create({
      data,
    });
  }

  async update(
    id: number,
    data: UpdateCarDto,
  ) {
    await this.findOne(id);

    return this.prisma.car.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    const car = await this.findOne(id);

    const rental =
      await this.prisma.rental.findFirst({
        where: {
          carId: car.id,
          status: {
            in: [
              'PENDING',
              'ACTIVE',
            ],
          },
        },
      });

    if (rental) {
      throw new BadRequestException(
        'Car still has active rental',
      );
    }

    return this.prisma.car.delete({
      where: {
        id,
      },
    });
  }
}
