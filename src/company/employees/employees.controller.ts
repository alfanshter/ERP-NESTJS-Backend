import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { GrantAccessDto } from './dto/grant-access.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import {
  employeePhotoStorage,
  compressEmployeePhoto,
} from '../../common/helpers/employee-photo-upload.helper';

@Controller('company/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: employeePhotoStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @CurrentUser() user: any,
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    // Compress and convert photo to WebP if uploaded
    if (photo) {
      const compressedPath = await compressEmployeePhoto(photo.path);
      const filename = compressedPath.split('/').pop();
      createEmployeeDto.photo = `/uploads/employees/${filename}`;
    }
    return this.employeesService.create(user.companyId, createEmployeeDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    return this.employeesService.findAll(
      user.companyId,
      page,
      limit,
      search,
      status,
      department,
    );
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.employeesService.getStats(user.companyId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.employeesService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: employeePhotoStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    // Compress and convert photo to WebP if uploaded
    if (photo) {
      const compressedPath = await compressEmployeePhoto(photo.path);
      const filename = compressedPath.split('/').pop();
      updateEmployeeDto.photo = `/uploads/employees/${filename}`;
    }
    return this.employeesService.update(user.companyId, id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.employeesService.remove(user.companyId, id);
  }

  @Post(':id/grant-access')
  @HttpCode(HttpStatus.OK)
  grantAccess(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() grantAccessDto: GrantAccessDto,
  ) {
    return this.employeesService.grantAccess(
      user.companyId,
      id,
      grantAccessDto,
    );
  }

  @Delete(':id/revoke-access')
  @HttpCode(HttpStatus.OK)
  revokeAccess(@CurrentUser() user: any, @Param('id') id: string) {
    return this.employeesService.revokeAccess(user.companyId, id);
  }
}
