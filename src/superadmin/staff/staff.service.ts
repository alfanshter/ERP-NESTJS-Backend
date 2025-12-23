import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSuperadminStaffDto } from './dto/create-staff.dto';
import { UpdateSuperadminStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';
import { deleteAvatar } from '../../common/helpers/avatar-upload.helper';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateSuperadminStaffDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createStaffDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Get superadmin-staff role
    const staffRole = await this.prisma.role.findUnique({
      where: { name: 'superadmin-staff' },
    });

    if (!staffRole) {
      throw new NotFoundException('Superadmin-staff role not found. Please run seeder.');
    }

    // Use default password if not provided
    const passwordToHash = createStaffDto.password || 'admin123';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Create user with superadmin-staff role
    const user = await this.prisma.user.create({
      data: {
        email: createStaffDto.email,
        password: hashedPassword,
        firstName: createStaffDto.firstName,
        lastName: createStaffDto.lastName,
        phone: createStaffDto.phone,
        avatar: createStaffDto.avatar,
        country: createStaffDto.country,
        address: createStaffDto.address,
        city: createStaffDto.city,
        postalCode: createStaffDto.postalCode,
        roleId: staffRole.id,
        companyId: null, // Superadmin staff tidak terikat ke company
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
        roleId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            isSystem: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return user;
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    // Get superadmin-staff and superadmin-master roles
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: ['superadmin-staff', 'superadmin-master'],
        },
      },
    });

    const roleIds = roles.map((role) => role.id);

    const where: any = {
      roleId: {
        in: roleIds,
      },
    };

    if (search) {
      where.OR = [
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException(`Superadmin staff with ID ${id} not found`);
    }

    // Verify it's a superadmin role
    if (
      user.role.name !== 'superadmin-staff' &&
      user.role.name !== 'superadmin-master'
    ) {
      throw new BadRequestException('User is not a superadmin staff');
    }

    return user;
  }

  async update(id: string, updateStaffDto: UpdateSuperadminStaffDto) {
    const user = await this.findOne(id);

    // Prevent updating superadmin-master
    if (user.role.name === 'superadmin-master') {
      throw new BadRequestException('Cannot update superadmin-master account');
    }

    // If new avatar provided, delete old one
    if (updateStaffDto.avatar && user.avatar) {
      deleteAvatar(user.avatar);
    }

    // Check if email is being changed and if it's already taken
    if (updateStaffDto.email && updateStaffDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateStaffDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    }

    const updateData: any = {
      email: updateStaffDto.email,
      firstName: updateStaffDto.firstName,
      lastName: updateStaffDto.lastName,
      phone: updateStaffDto.phone,
      avatar: updateStaffDto.avatar,
      country: updateStaffDto.country,
      address: updateStaffDto.address,
      city: updateStaffDto.city,
      postalCode: updateStaffDto.postalCode,
      isActive: updateStaffDto.isActive,
    };

    // If password is provided, hash it
    if (updateStaffDto.password) {
      updateData.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updatedUser = await this.prisma.user.update({
      where: { id },
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

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    // Prevent deleting superadmin-master
    if (user.role.name === 'superadmin-master') {
      throw new BadRequestException('Cannot delete superadmin-master account');
    }

    // Delete avatar if exists
    if (user.avatar) {
      deleteAvatar(user.avatar);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Superadmin staff deleted successfully' };
  }

  async bulkDelete(ids: string[]) {
    // Get all users to be deleted
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        avatar: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found with the provided IDs');
    }

    // Check if any user is superadmin-master
    const masterUsers = users.filter(
      (user) => user.role.name === 'superadmin-master',
    );

    if (masterUsers.length > 0) {
      throw new BadRequestException(
        'Cannot delete superadmin-master accounts. Please remove them from the list.',
      );
    }

    // Delete avatars for users that have them
    const avatarsToDelete = users.filter((user) => user.avatar);
    for (const user of avatarsToDelete) {
      if (user.avatar) {
        deleteAvatar(user.avatar);
      }
    }

    // Delete all users in a transaction
    const result = await this.prisma.user.deleteMany({
      where: {
        id: { in: ids },
        role: {
          name: {
            not: 'superadmin-master', // Extra safety check
          },
        },
      },
    });

    return {
      message: `Successfully deleted ${result.count} user(s)`,
      deletedCount: result.count,
      requestedIds: ids.length,
    };
  }

  async getStats() {
    const staffRole = await this.prisma.role.findUnique({
      where: { name: 'superadmin-staff' },
    });

    const masterRole = await this.prisma.role.findUnique({
      where: { name: 'superadmin-master' },
    });

    if (!staffRole || !masterRole) {
      return {
        totalStaff: 0,
        totalMaster: 0,
        activeStaff: 0,
        inactiveStaff: 0,
      };
    }

    const [totalStaff, totalMaster, activeStaff, inactiveStaff] = await Promise.all([
      this.prisma.user.count({ where: { roleId: staffRole.id } }),
      this.prisma.user.count({ where: { roleId: masterRole.id } }),
      this.prisma.user.count({
        where: { roleId: staffRole.id, isActive: true },
      }),
      this.prisma.user.count({
        where: { roleId: staffRole.id, isActive: false },
      }),
    ]);

    return {
      totalStaff,
      totalMaster,
      activeStaff,
      inactiveStaff,
    };
  }
}
