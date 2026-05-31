import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import cloudinary from '../cloudinary/cloudinary';
import type { Multer } from 'multer';

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

  async uploadProof(
    id: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    const uploaded =
      await cloudinary.uploader.upload(
        file.path,
        {
          folder: 'payments',
        },
      );

    const payment =
      await this.prisma.payment.update({
        where: {
          id,
        },

        data: {
          proofUrl: uploaded.secure_url,
        },
      });

    return {
      message:
        'Proof uploaded successfully',

      paymentId: payment.id,

      proofUrl: payment.proofUrl,
    };
  }
}
