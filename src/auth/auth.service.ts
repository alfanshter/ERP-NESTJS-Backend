import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, RegisterSuperadminDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      companyId: user.companyId,
      isSuperAdmin:
        user.role.name === 'superadmin-staff' ||
        user.role.name === 'superadmin-master',
      isSuperAdminMaster: user.role.name === 'superadmin-master',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        company: user.company?.name || null,
        isSuperAdmin:
          user.role.name === 'superadmin-staff' ||
          user.role.name === 'superadmin-master',
        isSuperAdminMaster: user.role.name === 'superadmin-master',
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // If companyId provided, check if company exists
    if (registerDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: registerDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    // Get default role
    let roleName = 'staff';

    if (registerDto.companyId) {
      // Check if this is first user in company
      const companyUsersCount = await this.prisma.user.count({
        where: { companyId: registerDto.companyId },
      });

      roleName = companyUsersCount === 0 ? 'admin' : 'staff';
    }

    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: role.id,
        companyId: registerDto.companyId,
        isActive: true,
      },
      include: {
        role: true,
        company: true,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async registerSuperadmin(registerDto: RegisterSuperadminDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Get superadmin-master role (first superadmin to register becomes master)
    const superadminMasterRole = await this.prisma.role.findFirst({
      where: { name: 'superadmin-master' },
    });

    if (!superadminMasterRole) {
      throw new NotFoundException('Superadmin-master role not found. Please run seeder.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create superadmin-master user (no companyId)
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: superadminMasterRole.id,
        companyId: null, // Superadmin tidak punya company
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    const { password: _, ...result } = user;
    return {
      message: 'Superadmin master registered successfully',
      user: result,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...result } = user;
    return result;
  }
}
