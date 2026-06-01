import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

import cloudinary from '../cloudinary/cloudinary';

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
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async create(data: CreateCarDto, file: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'cars',
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(file.buffer);
      });

      imageUrl = uploaded.secure_url;
    }

    return this.prisma.car.create({
      data: {
        ...data,

        pricePerDay: Number(data.pricePerDay),

        imageUrl,
      },
    });
  }

  async update(id: number, data: UpdateCarDto, file?: Express.Multer.File) {
    await this.findOne(id);

    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'cars',
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          )
          .end(file.buffer);
      });

      imageUrl = uploaded.secure_url;
    }

    return this.prisma.car.update({
      where: {
        id,
      },

      data: {
        ...data,

        ...(data.pricePerDay && {
          pricePerDay: Number(data.pricePerDay),
        }),

        ...(imageUrl && {
          imageUrl,
        }),
      },
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
