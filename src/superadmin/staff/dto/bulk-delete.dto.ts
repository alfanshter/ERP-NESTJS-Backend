import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID is required' })
  @IsString({ each: true })
  ids: string[];
}
