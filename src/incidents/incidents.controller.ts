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
import { CreateIncidentDto, UpdateIncidentDto } from './incidents.dto'
import { IncidentsService } from './incidents.service'

@Controller('incidents')
export class IncidentsController {
	constructor(private readonly incidentsService: IncidentsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	create(@Body() createIncidentDto: CreateIncidentDto) {
		return this.incidentsService.create(createIncidentDto)
	}

	@Get()
	findAll(
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '10',
	) {
		return this.incidentsService.findAll(+page, +limit)
	}

	@Get('statistics')
	getStatistics() {
		return this.incidentsService.getStatistics()
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.incidentsService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateIncidentDto: UpdateIncidentDto,
	) {
		return this.incidentsService.update(id, updateIncidentDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, OnlyAdminGuard)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.incidentsService.remove(id)
	}
}
