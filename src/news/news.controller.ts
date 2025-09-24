import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { OnlyAdminGuard } from '../auth/guards/admin.guard'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CreateNewsDto, UpdateNewsDto } from './news.dto'
import { NewsService } from './news.service'

@Controller('news')
export class NewsController {
	constructor(private readonly newsService: NewsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	create(@Body() createNewsDto: CreateNewsDto) {
		return this.newsService.create(createNewsDto)
	}

	@Get()
	findAll(
		@Query('published', new ParseBoolPipe({ optional: true }))
		published?: boolean,
	) {
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
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateNewsDto: UpdateNewsDto,
	) {
		return this.newsService.update(id, updateNewsDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.newsService.remove(id)
	}
}
