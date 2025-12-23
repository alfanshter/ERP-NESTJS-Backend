import { SetMetadata } from '@nestjs/common';

export const SUPERADMIN_MASTER_KEY = 'isSuperadminMaster';
export const SuperadminMaster = () => SetMetadata(SUPERADMIN_MASTER_KEY, true);
