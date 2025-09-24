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
import { EvacuationsService } from './evacuations.service';
import { CreateEvacuationDto, UpdateEvacuationDto } from './evacuations.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('evacuations')
export class EvacuationsController {
  constructor(private readonly evacuationsService: EvacuationsService) {}

  @Post()
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  create(
    @Body() createEvacuationDto: CreateEvacuationDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.evacuationsService.create(createEvacuationDto, userId);
  }

  @Get()
  findAll() {
    return this.evacuationsService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.evacuationsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evacuationsService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id') id: string,
    @Body() updateEvacuationDto: UpdateEvacuationDto,
  ) {
    return this.evacuationsService.update(+id, updateEvacuationDto);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.evacuationsService.remove(+id);
  }
}