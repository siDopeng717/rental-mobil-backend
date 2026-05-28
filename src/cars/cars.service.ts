import { Injectable } from '@nestjs/common';
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
    return this.prisma.car.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: CreateCarDto) {
    return this.prisma.car.create({
      data,
    });
  }

  async update(id: number, data: UpdateCarDto) {
    return this.prisma.car.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.car.delete({
      where: {
        id,
      },
    });
  }
}
