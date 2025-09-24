import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { EvacuationStatus } from '@prisma/client';

export class CreateEvacuationDto {
  @IsDateString()
  date: string;

  @IsString()
  location: string;

  @IsString()
  vehicleNumber: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  cost?: number;
}

export class UpdateEvacuationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsEnum(EvacuationStatus)
  status?: EvacuationStatus;
}