import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { MASTER_SUPERADMIN_KEY } from '../decorators/master-superadmin.decorator';

@Injectable()
export class MasterSuperadminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isMasterSuperadminRequired = this.reflector.getAllAndOverride<boolean>(
      MASTER_SUPERADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isMasterSuperadminRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user with role
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true },
    });

    if (!userWithRole || userWithRole.role.name !== 'master-superadmin') {
      throw new ForbiddenException('Only Master Superadmin can perform this action');
    }

    return true;
  }
}
