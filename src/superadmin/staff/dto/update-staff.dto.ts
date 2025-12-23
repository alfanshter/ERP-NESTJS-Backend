import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperadminStaffDto } from './create-staff.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSuperadminStaffDto extends PartialType(CreateSuperadminStaffDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
