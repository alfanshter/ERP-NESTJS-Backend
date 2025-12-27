import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { deleteFile } from '../../common/helpers/file-upload.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get default password for admin
   */
  private getDefaultPassword(): string {
    return 'admin123';
  }

  async create(createCompanyDto: CreateCompanyDto) {
    // Check if email already exists (for user)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `Email ${createCompanyDto.email} is already registered`,
      );
    }

    // Check if company name already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictException(
        `Company name ${createCompanyDto.name} already exists`,
      );
    }

    // Get admin role
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new NotFoundException(
        'Admin role not found. Please run database seed first.',
      );
    }

    // Use default password if not provided
    const plainPassword =
      createCompanyDto.adminPassword || this.getDefaultPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Extract admin fields from DTO
    const {
      adminPassword: _adminPassword,
      adminFirstName,
      adminLastName,
      ...companyData
    } = createCompanyDto;

    // Create company and admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: companyData,
      });

      // 2. Create admin user for this company
      const adminUser = await tx.user.create({
        data: {
          email: createCompanyDto.email,
          password: hashedPassword,
          firstName: adminFirstName || 'Admin',
          lastName: adminLastName || company.name,
          companyId: company.id,
          roleId: adminRole.id,
          isActive: true,
        },
      });

      return { company, adminUser, plainPassword };
    });

    // Fetch company with full details
    const company = await this.findOne(result.company.id);

    // Return with admin info (include temporary password only if auto-generated)
    return {
      ...company,
      adminCreated: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
        role: 'admin',
        ...(createCompanyDto.adminPassword
          ? {}
          : { temporaryPassword: result.plainPassword }),
      },
    };
  }

  async findAll(page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          region: {
            include: {
              parent: {
                include: {
                  parent: {
                    include: {
                      parent: true,
                    },
                  },
                },
              },
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
          _count: {
            select: {
              users: true,
              employees: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        region: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            employees: true,
            projects: true,
            procurements: true,
            invoices: true,
            expenses: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const existingCompany = await this.findOne(id); // Check if exists

    // Check if email is being changed and if it's already taken by another company
    if (updateCompanyDto.email && updateCompanyDto.email !== existingCompany.email) {
      const companyWithEmail = await this.prisma.company.findFirst({
        where: {
          email: updateCompanyDto.email,
          id: { not: id },
        },
      });

      if (companyWithEmail) {
        throw new ConflictException('Email already used by another company');
      }
    }

    // If new logo is uploaded and old logo exists, delete old logo file
    // logo stored as relative path like "logos/logo-123.jpg"
    if (updateCompanyDto.logo && existingCompany.logo) {
      deleteFile(existingCompany.logo);
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
      include: {
        region: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            users: true,
            employees: true,
            projects: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const company = await this.findOne(id); // Check if exists

    // Delete logo file if exists (logo stored as relative path like "logos/logo-123.jpg")
    if (company.logo) {
      deleteFile(company.logo);
    }

    return this.prisma.company.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, active, trial, suspended, inactive] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count({ where: { status: 'TRIAL' } }),
      this.prisma.company.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.company.count({ where: { status: 'INACTIVE' } }),
    ]);

    return {
      total,
      active,
      trial,
      suspended,
      inactive,
    };
  }
}
