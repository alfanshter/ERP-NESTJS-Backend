import { SetMetadata } from '@nestjs/common';

export const MASTER_SUPERADMIN_KEY = 'isMasterSuperadmin';
export const MasterSuperadmin = () => SetMetadata(MASTER_SUPERADMIN_KEY, true);
