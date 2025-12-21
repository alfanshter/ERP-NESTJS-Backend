import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { PricingPlansService } from './pricing-plans.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('superadmin/pricing-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class PricingPlansController {
  constructor(private readonly pricingPlansService: PricingPlansService) {}

  @Post()
  create(@Body() createPricingPlanDto: CreatePricingPlanDto) {
    return this.pricingPlansService.create(createPricingPlanDto);
  }

  @Get()
  findAll(
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ) {
    return this.pricingPlansService.findAll(includeInactive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePricingPlanDto: UpdatePricingPlanDto,
  ) {
    return this.pricingPlansService.update(id, updatePricingPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingPlansService.remove(id);
  }
}
