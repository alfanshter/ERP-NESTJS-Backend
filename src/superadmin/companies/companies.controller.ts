import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  logoStorage,
  imageFileFilter,
  MAX_FILE_SIZE,
  generateFileUrl,
} from '../../common/helpers/file-upload.helper';

@Controller('superadmin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: logoStorage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    // If file uploaded, generate URL and add to DTO
    if (file) {
      createCompanyDto.logo = generateFileUrl(req, file.filename);
    }
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.companiesService.findAll(page, limit, search, status);
  }

  @Get('stats')
  getStats() {
    return this.companiesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: logoStorage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    // If file uploaded, generate URL and add to DTO
    if (file) {
      updateCompanyDto.logo = generateFileUrl(req, file.filename);
    }
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
