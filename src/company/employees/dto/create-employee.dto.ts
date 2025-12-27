import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export class CreateEmployeeDto {
  @IsString()
  employeeCode: string; // Kode karyawan (misal: EMP001)

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  photo?: string; // Photo/profile picture path (opsional)

  @IsString()
  @IsOptional()
  position?: string; // Jabatan (misal: Software Engineer, Manager)

  @IsString()
  @IsOptional()
  department?: string; // Departemen (misal: IT, HR, Finance)

  @IsDateString()
  @IsOptional()
  joinDate?: string; // Tanggal bergabung

  @IsNumber()
  @IsOptional()
  salary?: number; // Gaji

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  // Address fields - sama seperti User & Company
  @IsString()
  @IsOptional()
  regionId?: string; // Region ID from autocomplete (e.g., "35.14.18.2007")

  @IsString()
  @IsOptional()
  address?: string; // Alamat detail (jalan, nomor, RT/RW)

  @IsString()
  @IsOptional()
  postalCode?: string; // Kode pos

  @IsString()
  @IsOptional()
  roleId?: string; // Role ID (default: staff if not provided)
}
