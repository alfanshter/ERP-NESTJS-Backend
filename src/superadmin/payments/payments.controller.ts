import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('superadmin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createDto);
  }

  @Post(':id/process')
  mockPaymentSuccess(
    @Param('id') id: string,
    @Body() processDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.mockPaymentSuccess(id, processDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('subscriptionId') subscriptionId?: string,
  ) {
    return this.paymentsService.findAll(page, limit, status, subscriptionId);
  }

  @Get('subscription/:subscriptionId')
  findBySubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentsService.findBySubscription(subscriptionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id);
  }
}
