import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import cloudinary from '../cloudinary/cloudinary';

import type { Multer } from 'multer';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

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

  async uploadProof(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: true,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment already confirmed');
    }

    if (payment.proofUrl) {
      throw new BadRequestException('Proof already uploaded');
    }

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'payments',
          },

          (error, result) => {
            if (error) {
              console.log(error);

              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });

    const updatedPayment = await this.prisma.payment.update({
      where: {
        id,
      },

      data: {
        proofUrl: uploaded.secure_url,
      },
    });

    return {
      message: 'Proof uploaded successfully',

      paymentId: updatedPayment.id,

      proofUrl: updatedPayment.proofUrl,
    };
  }

  async confirmPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: true,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (!payment.proofUrl) {
      throw new BadRequestException('Payment proof not uploaded');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment already confirmed');
    }

    await this.prisma.payment.update({
      where: {
        id,
      },

      data: {
        status: 'PAID',
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

    return {
      message: 'Payment confirmed',

      paymentId: payment.id,

      rentalId: payment.rentalId,

      amount: payment.amount,

      paymentStatus: 'PAID',

      rentalStatus: 'ACTIVE',
    };
  }

  async rejectPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: true,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (!payment.proofUrl) {
      throw new BadRequestException('No proof uploaded');
    }

    await this.prisma.payment.update({
      where: {
        id,
      },

      data: {
        status: 'REJECTED',

        proofUrl: null,
      },
    });

    return {
      message: 'Payment rejected',

      paymentId: payment.id,

      rentalId: payment.rentalId,

      paymentStatus: 'REJECTED',
    };
  }
}
