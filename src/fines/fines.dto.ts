import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { FineStatus } from '@prisma/client';

export class CreateFineDto {
  @IsString()
  vehicleNumber: string;

  @IsString()
  violationType: string;

  @IsNumber()
  amount: number;

  @IsString()
  location: string;

  @IsDateString()
  date: string;
}

export class UpdateFineDto {
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @IsOptional()
  @IsString()
  violationType?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(FineStatus)
  status?: FineStatus;
}