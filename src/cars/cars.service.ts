import {
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
    return this.prisma.car.findMany({
      where: {
        NOT: {
          status: 'INACTIVE',
        },
      },
    });
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

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.car.update({
      where: {
        id,
      },

      data: {
        status: 'INACTIVE',
      },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.car.update({
      where: {
        id,
      },

      data: {
        status: 'AVAILABLE',
      },
    });
  }
}
