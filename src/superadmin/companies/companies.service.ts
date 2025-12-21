import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  deleteFile,
  extractFilenameFromUrl,
  UPLOAD_DIR,
} from '../../common/helpers/file-upload.helper';
import { join } from 'path';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto,
      include: {
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

    // If new logo is uploaded and old logo exists, delete old logo file
    if (updateCompanyDto.logo && existingCompany.logo) {
      const oldFilename = extractFilenameFromUrl(existingCompany.logo);
      if (oldFilename) {
        const oldFilePath = join(UPLOAD_DIR, oldFilename);
        deleteFile(oldFilePath);
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
      include: {
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

    // Delete logo file if exists
    if (company.logo) {
      const filename = extractFilenameFromUrl(company.logo);
      if (filename) {
        const filePath = join(UPLOAD_DIR, filename);
        deleteFile(filePath);
      }
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
