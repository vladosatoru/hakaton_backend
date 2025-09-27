import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export enum DocumentCategory {
	REGULATION = 'REGULATION',
	REPORT = 'REPORT',
	INSTRUCTION = 'INSTRUCTION',
	BUDGET = 'BUDGET',
	OTHER = 'OTHER',
}

export class CreateDocumentDto {
	@IsString()
	title: string

	@IsString()
	@IsOptional()
	description?: string

	@IsString()
	fileName: string

	@IsString()
	filePath: string

	@IsNumber()
	fileSize: number

	@IsString()
	fileType: string

	@IsEnum(DocumentCategory)
	category: DocumentCategory

	@IsNumber()
	@IsOptional()
	authorId?: number
}

export class UpdateDocumentDto {
	@IsString()
	@IsOptional()
	title?: string

	@IsString()
	@IsOptional()
	description?: string

	@IsEnum(DocumentCategory)
	@IsOptional()
	category?: DocumentCategory
}