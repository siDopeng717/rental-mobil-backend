import {
  Controller,
  Param,
  Patch,
  UseGuards,
  Get,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.paymentsService.confirmPayment(
      Number(id),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  history(@Request() req: any) {
    return this.paymentsService.getHistory(
      req.user.userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/upload-proof')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentsService.uploadProof(
      Number(id),
      file,
    );
  }
}
