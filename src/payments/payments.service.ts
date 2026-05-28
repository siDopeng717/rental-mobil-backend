import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async confirmPayment(id: number) {
    const payment = await this.prisma.payment.update({
      where: {
        id,
      },

      data: {
        status: 'PAID',
      },

      include: {
        rental: true,
      },
    });

    await this.prisma.rental.update({
      where: {
        id: payment.rentalId,
      },

      data: {
        status: 'ACTIVE',
      },
    });

    return payment;
  }
}