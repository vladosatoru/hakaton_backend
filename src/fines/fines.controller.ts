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
import { FinesService } from './fines.service';
import { CreateFineDto, UpdateFineDto } from './fines.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  create(
    @Body() createFineDto: CreateFineDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.finesService.create(createFineDto, userId);
  }

  @Get()
  findAll() {
    return this.finesService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.finesService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finesService.findOne(+id);
  }

  @Patch(':id')
  @Auth('admin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id') id: string,
    @Body() updateFineDto: UpdateFineDto,
  ) {
    return this.finesService.update(+id, updateFineDto);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.finesService.remove(+id);
  }
}