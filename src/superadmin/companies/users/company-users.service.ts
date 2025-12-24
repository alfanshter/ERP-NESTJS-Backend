import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCompanyUserDto, UpdateCompanyUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyUsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCompanyExists(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
  }

  async findAll(companyId: string, page = 1, limit = 10, search?: string) {
    await this.assertCompanyExists(companyId);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId };

    if (search) {
      (where as any).OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          country: true,
          address: true,
          city: true,
          postalCode: true,
          isActive: true,
          companyId: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(companyId: string, dto: CreateCompanyUserDto) {
    await this.assertCompanyExists(companyId);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role ${dto.roleName} not found`);
    }

    // Prevent assigning superadmin roles to company users
    if (
      role.name === 'superadmin' ||
      role.name === 'superadmin-master' ||
      role.name === 'superadmin-staff'
    ) {
      throw new BadRequestException(
        'Cannot assign superadmin roles to company users',
      );
    }

    // Default password if not provided
    const passwordToHash = dto.password || 'admin123';
    const hashed = await bcrypt.hash(passwordToHash, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        country: dto.country,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
        companyId,
        roleId: role.id,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        country: true,
        address: true,
        city: true,
        postalCode: true,
        isActive: true,
        companyId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(companyId: string, userId: string) {
    await this.assertCompanyExists(companyId);

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        country: true,
        address: true,
        city: true,
        postalCode: true,
        isActive: true,
        companyId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found for this company');
    }

    return user;
  }

  async update(companyId: string, userId: string, dto: UpdateCompanyUserDto) {
    const existing = await this.findOne(companyId, userId);

    let roleId: string | undefined;

    if (dto.email && dto.email !== existing.email) {
      const other = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (other) {
        throw new ConflictException('Email already registered');
      }
    }

    if (dto.roleName) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.roleName },
      });
      if (!role) {
        throw new NotFoundException(`Role ${dto.roleName} not found`);
      }

      // Prevent assigning superadmin roles to company users
      if (
        role.name === 'superadmin' ||
        role.name === 'superadmin-master' ||
        role.name === 'superadmin-staff'
      ) {
        throw new BadRequestException(
          'Cannot assign superadmin roles to company users',
        );
      }

      roleId = role.id;
    }

    const updateData: any = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      country: dto.country,
      address: dto.address,
      city: dto.city,
      postalCode: dto.postalCode,
      isActive: dto.isActive,
    };

    if (roleId) {
      updateData.roleId = roleId;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        country: true,
        address: true,
        city: true,
        postalCode: true,
        isActive: true,
        companyId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(companyId: string, userId: string) {
    await this.findOne(companyId, userId);

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Company user deleted successfully' };
  }
}
