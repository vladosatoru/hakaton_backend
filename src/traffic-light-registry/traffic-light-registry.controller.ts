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
import { TrafficLightRegistryService } from './traffic-light-registry.service';
import { CreateTrafficLightRegistryDto, UpdateTrafficLightRegistryDto, TrafficLightRegistryFilterDto } from './dto/traffic-light-registry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('traffic-light-registry')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrafficLightRegistryController {
  constructor(private readonly trafficLightRegistryService: TrafficLightRegistryService) {}

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  create(@Body() createTrafficLightRegistryDto: CreateTrafficLightRegistryDto) {
    return this.trafficLightRegistryService.create(createTrafficLightRegistryDto);
  }

  @Public()
  @Get('public')
  findAllPublic(@Query() filter: TrafficLightRegistryFilterDto) {
    return this.trafficLightRegistryService.getPublicRegistry(filter);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get()
  findAll(@Query() filter: TrafficLightRegistryFilterDto) {
    return this.trafficLightRegistryService.findAll(filter);
  }

  @Public()
  @Get('statistics')
  getStatistics() {
    return this.trafficLightRegistryService.getStatistics();
  }

  @Public()
  @Get('registry/:registryNumber')
  findByRegistryNumber(@Param('registryNumber', ParseIntPipe) registryNumber: number) {
    return this.trafficLightRegistryService.findByRegistryNumber(registryNumber);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trafficLightRegistryService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrafficLightRegistryDto: UpdateTrafficLightRegistryDto,
  ) {
    return this.trafficLightRegistryService.update(id, updateTrafficLightRegistryDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trafficLightRegistryService.remove(id);
  }
}