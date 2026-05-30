import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    data: CreateRentalDto,
  ) {
    const car = await this.prisma.car.findUnique({
      where: {
        id: data.carId,
      },
    });

    if (!car) {
      throw new BadRequestException(
        'Car not found',
      );
    }

    if (car.status !== 'AVAILABLE') {
      throw new BadRequestException(
        'Car is not available',
      );
    }

    const startDate = new Date(
      data.startDate,
    );

    const endDate = new Date(
      data.endDate,
    );

    const diffTime =
      endDate.getTime() -
      startDate.getTime();

    const totalDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24),
    );

    if (totalDays <= 0) {
      throw new BadRequestException(
        'End date must be after start date',
      );
    }

    const totalPrice =
      totalDays * car.pricePerDay;

    const rental =
      await this.prisma.rental.create({
        data: {
          userId,
          carId: data.carId,
          startDate,
          endDate,
          totalPrice,

          payment: {
            create: {
              amount: totalPrice,
            },
          },
        },

        include: {
          car: true,
          payment: true,
        },
      });

    await this.prisma.car.update({
      where: {
        id: car.id,
      },
      data: {
        status: 'RENTED',
      },
    });

    return rental;
  }

  async findMyRentals(
    userId: number,
  ) {
    return this.prisma.rental.findMany({
      where: {
        userId,
      },

      include: {
        car: true,
        payment: true,
      },
    });
  }
}