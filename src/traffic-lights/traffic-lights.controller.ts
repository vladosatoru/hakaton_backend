import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TrafficLightsService } from './traffic-lights.service';
import { CreateTrafficLightDto, UpdateTrafficLightDto } from './traffic-lights.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('traffic-lights')
export class TrafficLightsController {
  constructor(private readonly trafficLightsService: TrafficLightsService) {}

  @Post()
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  create(
    @Body() createTrafficLightDto: CreateTrafficLightDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.trafficLightsService.create(createTrafficLightDto, userId);
  }

  @Get()
  findAll() {
    return this.trafficLightsService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.trafficLightsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trafficLightsService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id') id: string,
    @Body() updateTrafficLightDto: UpdateTrafficLightDto,
  ) {
    return this.trafficLightsService.update(+id, updateTrafficLightDto);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.trafficLightsService.remove(+id);
  }
}