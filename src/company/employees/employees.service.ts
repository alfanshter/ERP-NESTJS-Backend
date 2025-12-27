import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { GrantAccessDto } from './dto/grant-access.dto';
import { RegionsService } from '../../regions/regions.service';
import { deleteEmployeePhoto } from '../../common/helpers/employee-photo-upload.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createEmployeeDto: CreateEmployeeDto) {
    // Check if employee code already exists in this company
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        employeeCode: createEmployeeDto.employeeCode,
        companyId,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        `Employee code ${createEmployeeDto.employeeCode} already exists in your company`,
      );
    }

    // Check if email already exists in this company
    const existingEmail = await this.prisma.employee.findFirst({
      where: {
        email: createEmployeeDto.email,
        companyId,
      },
    });

    if (existingEmail) {
      throw new ConflictException(
        `Email ${createEmployeeDto.email} already exists in your company`,
      );
    }

    // Get default staff role if roleId not provided
    let roleId = createEmployeeDto.roleId;
    if (!roleId) {
      const staffRole = await this.prisma.role.findUnique({
        where: { name: 'staff' },
      });
      if (!staffRole) {
        throw new NotFoundException('Staff role not found');
      }
      roleId = staffRole.id;
    }

    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        companyId,
        roleId,
      },
      include: {
        role: true,
        region: RegionsService.getFullRegionInclude(), // Include full hierarchy
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    department?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          region: RegionsService.getFullRegionInclude(), // Include full hierarchy
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        role: true,
        region: RegionsService.getFullRegionInclude(), // Include full hierarchy
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        projectTasks: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(
    companyId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    // Check if employee exists and belongs to company
    const existingEmployee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      select: { id: true, employeeCode: true, email: true, photo: true },
    });

    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check if employee code is being changed and already exists
    if (
      updateEmployeeDto.employeeCode &&
      updateEmployeeDto.employeeCode !== existingEmployee.employeeCode
    ) {
      const existingCode = await this.prisma.employee.findFirst({
        where: {
          employeeCode: updateEmployeeDto.employeeCode,
          companyId,
          id: { not: id },
        },
      });

      if (existingCode) {
        throw new ConflictException(
          `Employee code ${updateEmployeeDto.employeeCode} already exists`,
        );
      }
    }

    // Check if email is being changed and already exists
    if (
      updateEmployeeDto.email &&
      updateEmployeeDto.email !== existingEmployee.email
    ) {
      const existingEmail = await this.prisma.employee.findFirst({
        where: {
          email: updateEmployeeDto.email,
          companyId,
          id: { not: id },
        },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Email ${updateEmployeeDto.email} already exists`,
        );
      }
    }

    // Delete old photo if new photo is uploaded
    if (updateEmployeeDto.photo && existingEmployee.photo) {
      deleteEmployeePhoto(existingEmployee.photo);
    }

    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
      include: {
        role: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(companyId: string, id: string) {
    // Check if employee exists and belongs to company
    await this.findOne(companyId, id);

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async getStats(companyId: string) {
    const [total, active, inactive, onLeave, terminated, byDepartment] =
      await Promise.all([
        this.prisma.employee.count({ where: { companyId } }),
        this.prisma.employee.count({
          where: { companyId, status: 'ACTIVE' },
        }),
        this.prisma.employee.count({
          where: { companyId, status: 'INACTIVE' },
        }),
        this.prisma.employee.count({
          where: { companyId, status: 'ON_LEAVE' },
        }),
        this.prisma.employee.count({
          where: { companyId, status: 'TERMINATED' },
        }),
        this.prisma.employee.groupBy({
          by: ['department'],
          where: { companyId },
          _count: true,
        }),
      ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        onLeave,
        terminated,
      },
      byDepartment: byDepartment.map((d) => ({
        department: d.department || 'Unassigned',
        count: d._count,
      })),
    };
  }

  async grantAccess(
    companyId: string,
    employeeId: string,
    grantAccessDto: GrantAccessDto,
  ) {
    // Find employee
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      include: { user: true, role: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee already has user access
    if (employee.userId) {
      throw new ConflictException('Employee already has login access');
    }

    // Check if email already used by another user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: employee.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'This email is already used by another user account',
      );
    }

    // Validate role exists
    const role = await this.prisma.role.findUnique({
      where: { id: grantAccessDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Don't allow granting superadmin roles to employees
    if (
      role.name === 'superadmin-master' ||
      role.name === 'superadmin-staff'
    ) {
      throw new BadRequestException(
        'Cannot grant superadmin roles to employees',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(grantAccessDto.password, 10);

    // Create user account
    const user = await this.prisma.user.create({
      data: {
        email: employee.email,
        password: hashedPassword,
        firstName: employee.firstName,
        lastName: employee.lastName,
        avatar: employee.avatar,
        phone: employee.phone,
        roleId: grantAccessDto.roleId,
        companyId: employee.companyId,
        isActive: true,
      },
    });

    // Link employee to user
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { userId: user.id },
    });

    return {
      message: 'Login access granted successfully',
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        hasAccess: true,
      },
    };
  }

  async revokeAccess(companyId: string, employeeId: string) {
    // Find employee
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee has user access
    if (!employee.userId) {
      throw new BadRequestException('Employee does not have login access');
    }

    // Delete user account
    await this.prisma.user.delete({
      where: { id: employee.userId },
    });

    // Update employee (userId will be set to null automatically by onDelete: SetNull)
    return {
      message: 'Login access revoked successfully',
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        hasAccess: false,
      },
    };
  }
}
