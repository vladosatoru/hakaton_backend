import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { OnlyAdminGuard } from '../auth/guards/admin.guard'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CreateDocumentDto, DocumentCategory, UpdateDocumentDto } from './documents.dto'
import { DocumentsService } from './documents.service'

@Controller('documents')
export class DocumentsController {
	constructor(private readonly documentsService: DocumentsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	create(@Body() createDocumentDto: CreateDocumentDto) {
		return this.documentsService.create(createDocumentDto)
	}

	@Get()
	findAll(@Query('category') category?: DocumentCategory) {
		return this.documentsService.findAll(category)
	}

	@Get('statistics')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	getStatistics() {
		return this.documentsService.getStatistics()
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.documentsService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateDocumentDto: UpdateDocumentDto) {
		return this.documentsService.update(id, updateDocumentDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.documentsService.remove(id)
	}
}