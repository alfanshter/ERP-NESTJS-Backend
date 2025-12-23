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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StaffService } from './staff.service';
import { CreateSuperadminStaffDto } from './dto/create-staff.dto';
import { UpdateSuperadminStaffDto } from './dto/update-staff.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperadminMasterGuard } from '../../auth/guards/superadmin-master.guard';
import { SuperadminMaster } from '../../auth/decorators/superadmin-master.decorator';
import { AvatarUrlInterceptor } from '../../common/interceptors/avatar-url.interceptor';
import {
  avatarStorage,
  imageFileFilter,
  compressAvatar,
} from '../../common/helpers/avatar-upload.helper';

@Controller('superadmin/staff')
@UseGuards(JwtAuthGuard, SuperadminMasterGuard)
@SuperadminMaster()
@UseInterceptors(AvatarUrlInterceptor)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max before compression
    }),
  )
  async create(
    @Body() createStaffDto: CreateSuperadminStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // If avatar uploaded, compress and store relative path only
    if (file) {
      const compressedPath = await compressAvatar(file.path);
      const filename = compressedPath.split('/').pop();
      if (filename) {
        // Store relative path only: "avatars/filename.jpg"
        createStaffDto.avatar = `avatars/${filename}`;
      }
    }

    return this.staffService.create(createStaffDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.staffService.findAll(page, limit, search);
  }

  @Get('stats')
  getStats() {
    return this.staffService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max before compression
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateSuperadminStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // If new avatar uploaded, compress and store relative path only
    if (file) {
      const compressedPath = await compressAvatar(file.path);
      const filename = compressedPath.split('/').pop();
      if (filename) {
        // Store relative path only: "avatars/filename.jpg"
        updateStaffDto.avatar = `avatars/${filename}`;
      }
    }

    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @Post('bulk-delete')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.staffService.bulkDelete(bulkDeleteDto.ids);
  }
}
