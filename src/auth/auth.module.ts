import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MasterSuperadminGuard } from './guards/master-superadmin.guard';
import { SuperadminMasterGuard } from './guards/superadmin-master.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: '7d', // Token expire dalam 7 hari
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    MasterSuperadminGuard,
    SuperadminMasterGuard,
  ],
  exports: [AuthService, JwtModule, SuperadminMasterGuard],
})
export class AuthModule {}
