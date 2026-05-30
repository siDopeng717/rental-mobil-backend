import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

async confirmPayment(id: number) {
  await this.prisma.payment.update({
    where: {
      id,
    },

    data: {
      status: 'PAID',
    },
  });

  const payment =
    await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: true,
      },
    });

  await this.prisma.rental.update({
    where: {
      id: payment?.rentalId,
    },

    data: {
      status: 'ACTIVE',
    },
  });

  return {
    message: 'Payment confirmed',
    paymentId: payment?.id,
    rentalId: payment?.rentalId,
    amount: payment?.amount,
    paymentStatus: 'PAID',
    rentalStatus: 'ACTIVE',
  };
}

  async getHistory(userId: number) {
    return this.prisma.payment.findMany({
      where: {
        rental: {
          userId,
        },
      },

      include: {
        rental: {
          include: {
            car: true,
          },
        },
      },
    });
  }
}
