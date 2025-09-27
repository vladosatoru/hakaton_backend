import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FineStatisticsService } from './fine-statistics.service';
import { CreateFineStatisticsDto, UpdateFineStatisticsDto, FineStatisticsFilterDto } from './dto/fine-statistics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('fine-statistics')
@Controller('fine-statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FineStatisticsController {
  constructor(private readonly fineStatisticsService: FineStatisticsService) {}

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  create(@Body() createFineStatisticsDto: CreateFineStatisticsDto) {
    return this.fineStatisticsService.create(createFineStatisticsDto);
  }

  @Public()
  @Get()
  findAll(@Query() filter: FineStatisticsFilterDto) {
    // Для публичного доступа показываем только публичные данные
    return this.fineStatisticsService.findAll({ ...filter, isPublic: true });
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  findAllAdmin(@Query() filter: FineStatisticsFilterDto) {
    // Администратор видит все данные
    return this.fineStatisticsService.findAll(filter);
  }

  @Public()
  @Get('analytics')
  getAnalytics(@Query('year', ParseIntPipe) year?: number) {
    return this.fineStatisticsService.getAnalytics(year);
  }

  @Public()
  @Get('compare/:year1/:year2')
  compareYears(
    @Param('year1', ParseIntPipe) year1: number,
    @Param('year2', ParseIntPipe) year2: number,
  ) {
    return this.fineStatisticsService.compareYears(year1, year2);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fineStatisticsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFineStatisticsDto: UpdateFineStatisticsDto,
  ) {
    return this.fineStatisticsService.update(id, updateFineStatisticsDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fineStatisticsService.remove(id);
  }
}