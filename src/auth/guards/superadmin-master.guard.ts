import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPERADMIN_MASTER_KEY } from '../decorators/superadmin-master.decorator';

@Injectable()
export class SuperadminMasterGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresSuperadminMaster = this.reflector.getAllAndOverride<boolean>(
      SUPERADMIN_MASTER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresSuperadminMaster) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has superadmin-master role
    if (user.role?.name !== 'superadmin-master') {
      throw new ForbiddenException(
        'Access denied. This action requires superadmin-master privilege.',
      );
    }

    return true;
  }
}
