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
import { EvacuationRequestsService } from './evacuation-requests.service';
import { CreateEvacuationRequestDto, UpdateEvacuationRequestDto, EvacuationRequestFilterDto } from './dto/evacuation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, EvacuationRequestStatus } from '@prisma/client';

@Controller('evacuation-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvacuationRequestsController {
  constructor(private readonly evacuationRequestsService: EvacuationRequestsService) {}

  @Public()
  @Post()
  create(@Body() createEvacuationRequestDto: CreateEvacuationRequestDto) {
    return this.evacuationRequestsService.create(createEvacuationRequestDto);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get()
  findAll(@Query() filter: EvacuationRequestFilterDto) {
    return this.evacuationRequestsService.findAll(filter);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('statistics')
  getStatistics() {
    return this.evacuationRequestsService.getStatistics();
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evacuationRequestsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvacuationRequestDto: UpdateEvacuationRequestDto,
  ) {
    return this.evacuationRequestsService.update(id, updateEvacuationRequestDto);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: EvacuationRequestStatus,
  ) {
    return this.evacuationRequestsService.updateStatus(id, status);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evacuationRequestsService.remove(id);
  }
}