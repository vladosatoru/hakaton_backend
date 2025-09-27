import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { EvacuationRequestStatus } from '@prisma/client';

export class CreateEvacuationRequestDto {
  @IsString()
  address: string;

  @IsString()
  vehicleType: string;

  @IsString()
  contactName: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEvacuationRequestDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsEnum(EvacuationRequestStatus)
  status?: EvacuationRequestStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EvacuationRequestFilterDto {
  @IsOptional()
  @IsEnum(EvacuationRequestStatus)
  status?: EvacuationRequestStatus;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  address?: string;
}