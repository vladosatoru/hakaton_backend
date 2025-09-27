import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DeviceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTrafficLightRegistryDto {
  @IsInt()
  @Min(1)
  registryNumber: number;

  @IsString()
  address: string;

  @IsString()
  lightType: string;

  @IsInt()
  @Min(1900)
  installYear: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}

export class UpdateTrafficLightRegistryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  registryNumber?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  lightType?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  installYear?: number;

  @IsOptional()
  @IsString()
  status?: DeviceStatus;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class TrafficLightRegistryFilterDto {
  @IsOptional()
  @IsString()
  lightType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  installYear?: number;

  @IsOptional()
  @IsString()
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}