import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	ParseIntPipe,
	ParseBoolPipe,
} from '@nestjs/common'
import { NewsService } from './news.service'
import { CreateNewsDto, UpdateNewsDto } from './news.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { OnlyAdminGuard } from '../auth/guards/admin.guard'

@Controller('news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	create(@Body() createNewsDto: CreateNewsDto) {
		return this.newsService.create(createNewsDto)
	}

	@Get()
	findAll(@Query('published', new ParseBoolPipe({ optional: true })) published?: boolean) {
		return this.newsService.findAll(published)
	}

	@Get('statistics')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	getStatistics() {
		return this.newsService.getStatistics()
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.newsService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto) {
		return this.newsService.update(id, updateNewsDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.newsService.remove(id)
	}
}