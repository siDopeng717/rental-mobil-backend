import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.prisma.user.create({
      data,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const relatedRental = await this.prisma.rental.findFirst({
      where: {
        userId: id,
      },
    });

    if (relatedRental) {
      throw new BadRequestException(
        'User cannot be deleted because they already have rental history',
      );
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
