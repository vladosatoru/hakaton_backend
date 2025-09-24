import {
	IsBoolean,
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator'

export class CreateNewsDto {
	@IsString()
	title: string

	@IsString()
	content: string

	@IsString()
	@IsOptional()
	summary?: string

	@IsString()
	@IsOptional()
	imageUrl?: string

	@IsBoolean()
	@IsOptional()
	isPublished?: boolean

	@IsDateString()
	@IsOptional()
	publishedAt?: string

	@IsNumber()
	@IsOptional()
	authorId?: number
}

export class UpdateNewsDto {
	@IsString()
	@IsOptional()
	title?: string

	@IsString()
	@IsOptional()
	content?: string

	@IsString()
	@IsOptional()
	summary?: string

	@IsString()
	@IsOptional()
	imageUrl?: string

	@IsBoolean()
	@IsOptional()
	isPublished?: boolean

	@IsDateString()
	@IsOptional()
	publishedAt?: string
}
