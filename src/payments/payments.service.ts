import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Multer } from 'multer';
import cloudinary from '../cloudinary/cloudinary';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // USER
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

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ADMIN
  async findAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        rental: {
          include: {
            user: true,
            car: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // USER
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

    if (payment.status === 'REJECTED') {
      throw new BadRequestException('Payment has been rejected');
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

  // ADMIN
  async confirmPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: {
          include: {
            car: true,
          },
        },
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

    await this.prisma.car.update({
      where: {
        id: payment.rental.carId,
      },

      data: {
        status: 'RENTED',
      },
    });

    return {
      message: 'Payment confirmed',

      paymentId: payment.id,

      rentalId: payment.rentalId,

      amount: payment.amount,

      paymentStatus: 'PAID',

      rentalStatus: 'ACTIVE',

      carStatus: 'RENTED',
    };
  }

  // ADMIN
  async rejectPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        rental: {
          include: {
            car: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (!payment.proofUrl) {
      throw new BadRequestException('No proof uploaded');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Paid payment cannot be rejected');
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

    await this.prisma.rental.update({
      where: {
        id: payment.rentalId,
      },

      data: {
        status: 'PENDING',
      },
    });

    await this.prisma.car.update({
      where: {
        id: payment.rental.carId,
      },
      data: {
        status: 'AVAILABLE',
      },
    });

    return {
      message: 'Payment rejected',
      paymentId: payment.id,
      rentalId: payment.rentalId,
      paymentStatus: 'REJECTED',
      rentalStatus: 'PENDING',
    };
  }
}
