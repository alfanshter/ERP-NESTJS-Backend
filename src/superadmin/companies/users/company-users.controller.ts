import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AvatarUrlInterceptor } from '../../../common/interceptors/avatar-url.interceptor';
import { CompanyUsersService } from './company-users.service';
import { CreateCompanyUserDto, UpdateCompanyUserDto } from './dto';

@Controller('superadmin/companies/:companyId/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
@UseInterceptors(AvatarUrlInterceptor)
export class CompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @Get()
  findAll(
    @Param('companyId') companyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.companyUsersService.findAll(companyId, page, limit, search);
  }

  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() createDto: CreateCompanyUserDto,
  ) {
    return this.companyUsersService.create(companyId, createDto);
  }

  @Get(':userId')
  findOne(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
  ) {
    return this.companyUsersService.findOne(companyId, userId);
  }

  @Patch(':userId')
  update(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateCompanyUserDto,
  ) {
    return this.companyUsersService.update(companyId, userId, updateDto);
  }

  @Delete(':userId')
  remove(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
  ) {
    return this.companyUsersService.remove(companyId, userId);
  }
}
