import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairServiceDto } from './create-repair-service.dto';

export class UpdateRepairServiceDto extends PartialType(CreateRepairServiceDto) {}
