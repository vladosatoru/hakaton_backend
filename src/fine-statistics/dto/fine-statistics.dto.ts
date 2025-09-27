import { IsBoolean, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFineStatisticsDto {
  @IsDateString()
  date: string;

  @IsInt()
  @Min(0)
  year: number;

  @IsInt()
  @Min(0)
  violationsDetected: number;

  @IsInt()
  @Min(0)
  decreesIssued: number;

  @IsInt()
  @Min(0)
  finesImposed: number;

  @IsInt()
  @Min(0)
  finesCollected: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}

export class UpdateFineStatisticsDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  violationsDetected?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  decreesIssued?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  finesImposed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  finesCollected?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class FineStatisticsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

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