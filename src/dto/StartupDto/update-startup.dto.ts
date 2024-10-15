import { PartialType } from '@nestjs/mapped-types';
import { CreateStartupDto } from './create-startup.dto';

export class UpdateStartupDto extends PartialType(CreateStartupDto){}