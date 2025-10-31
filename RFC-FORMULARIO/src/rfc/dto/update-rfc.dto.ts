import { PartialType } from '@nestjs/mapped-types';
import { CreateRfcDto } from './create-rfc.dto';

export class UpdateRfcDto extends PartialType(CreateRfcDto) {}
