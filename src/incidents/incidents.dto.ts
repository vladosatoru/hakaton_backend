import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator'

export class CreateIncidentDto {
	@IsEnum(['TRAFFIC', 'ACCIDENT', 'ROAD_WORK', 'WEATHER', 'OTHER'])
	type: string

	@IsDateString()
	date: string

	@IsString()
	location: string

	@IsString()
	description: string

	@IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
	@IsOptional()
	severity?: string

	@IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
	@IsOptional()
	status?: string

	@IsNumber()
	@IsOptional()
	latitude?: number

	@IsNumber()
	@IsOptional()
	longitude?: number

	@IsNumber()
	@IsOptional()
	userId?: number
}

export class UpdateIncidentDto {
	@IsEnum(['TRAFFIC', 'ACCIDENT', 'ROAD_WORK', 'WEATHER', 'OTHER'])
	@IsOptional()
	type?: string

	@IsDateString()
	@IsOptional()
	date?: string

	@IsString()
	@IsOptional()
	location?: string

	@IsString()
	@IsOptional()
	description?: string

	@IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
	@IsOptional()
	severity?: string

	@IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
	@IsOptional()
	status?: string

	@IsNumber()
	@IsOptional()
	latitude?: number

	@IsNumber()
	@IsOptional()
	longitude?: number
}