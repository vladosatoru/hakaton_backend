import { IsString, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { TrafficLightType, DeviceStatus } from '@prisma/client';

export class CreateTrafficLightDto {
  @IsString()
  address: string;

  @IsEnum(TrafficLightType)
  type: TrafficLightType;

  @IsDateString()
  installDate: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateTrafficLightDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(TrafficLightType)
  type?: TrafficLightType;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsDateString()
  lastMaintenance?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}