import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { ImportDataDto, ExportDataDto, DataType } from './dto/import-export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('import-export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Roles(UserRole.ADMIN)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @Body() importDto: ImportDataDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importExportService.importData(file, importDto);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post('export')
  async exportData(@Body() exportDto: ExportDataDto, @Res() res: Response) {
    const fileBuffer = await this.importExportService.exportData(exportDto);
    
    const filename = exportDto.filename || `${exportDto.dataType}_export`;
    const extension = exportDto.format;
    const contentType = exportDto.format === 'xlsx' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      'Content-Length': fileBuffer.length,
    });

    res.send(fileBuffer);
  }

  @Roles(UserRole.ADMIN)
  @Post('analyze-file')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: DataType,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.importExportService.getColumnMapping(file, dataType);
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('data-types')
  getDataTypes() {
    return {
      dataTypes: Object.values(DataType).map(type => ({
        value: type,
        label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
    };
  }

  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('export-preview')
  async getExportPreview(@Query() query: any) {
    const { dataType, ...filters } = query;
    
    if (!dataType) {
      throw new BadRequestException('dataType is required');
    }

    // Получаем первые 10 записей для предварительного просмотра
    const data = await this.importExportService['getDataForExport'](dataType, filters);
    
    return {
      preview: data.slice(0, 10),
      total: data.length,
      columns: data.length > 0 ? Object.keys(data[0]) : [],
    };
  }
}