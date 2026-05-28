import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarsModule } from './cars/cars.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RentalsModule } from './rentals/rentals.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [CarsModule, PrismaModule, UsersModule, AuthModule, RentalsModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
