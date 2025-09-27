import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DataType, FileFormat, ImportDataDto, ExportDataDto } from './dto/import-export.dto';
import * as XLSX from 'xlsx';
import * as csv from 'fast-csv';
import { Readable } from 'stream';

@Injectable()
export class ImportExportService {
  constructor(private prisma: PrismaService) {}

  async importData(file: Express.Multer.File, importDto: ImportDataDto) {
    try {
      let data: any[];

      // Парсим файл в зависимости от формата
      if (file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx')) {
        data = this.parseExcelFile(file.buffer);
      } else if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        data = await this.parseCsvFile(file.buffer);
      } else {
        throw new BadRequestException('Unsupported file format. Please use XLSX or CSV.');
      }

      // Применяем сопоставление столбцов если указано
      if (importDto.columnMapping) {
        data = this.applyColumnMapping(data, importDto.columnMapping);
      }

      // Импортируем данные в соответствующую таблицу
      const result = await this.importToDatabase(data, importDto.dataType);

      return {
        success: true,
        imported: result.imported,
        errors: result.errors,
        total: data.length,
      };
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async exportData(exportDto: ExportDataDto) {
    try {
      const data = await this.getDataForExport(exportDto.dataType, exportDto.filters);
      
      if (exportDto.format === FileFormat.XLSX) {
        return this.generateExcelFile(data, exportDto.filename);
      } else {
        return this.generateCsvFile(data, exportDto.filename);
      }
    } catch (error) {
      throw new BadRequestException(`Export failed: ${error.message}`);
    }
  }

  private parseExcelFile(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer);
      
      stream
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private applyColumnMapping(data: any[], mapping: Record<string, string>): any[] {
    return data.map(row => {
      const mappedRow: any = {};
      Object.keys(mapping).forEach(fileColumn => {
        const dbField = mapping[fileColumn];
        if (row[fileColumn] !== undefined) {
          mappedRow[dbField] = this.convertValue(row[fileColumn], dbField);
        }
      });
      return mappedRow;
    });
  }

  private convertValue(value: any, fieldName: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Конвертация дат
    if (fieldName.includes('date') || fieldName.includes('Date')) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    // Конвертация чисел
    if (fieldName.includes('year') || fieldName.includes('count') || 
        fieldName.includes('amount') || fieldName.includes('cost') ||
        fieldName.includes('Number')) {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }

    // Конвертация булевых значений
    if (fieldName.includes('isPublic') || fieldName.includes('isActive')) {
      return Boolean(value);
    }

    return String(value);
  }

  private async importToDatabase(data: any[], dataType: DataType) {
    const imported: any[] = [];
    const errors: any[] = [];

    for (const [index, item] of data.entries()) {
      try {
        let result;
        
        switch (dataType) {
          case DataType.FINE_STATISTICS:
            result = await this.prisma.fineStatistics.create({ data: item });
            break;
          case DataType.EVACUATION_STATISTICS:
            result = await this.prisma.evacuationStatistics.create({ data: item });
            break;
          case DataType.TRAFFIC_LIGHT_REGISTRY:
            result = await this.prisma.trafficLightRegistry.create({ data: item });
            break;
          case DataType.EVACUATION_ROUTES:
            result = await this.prisma.evacuationRoute.create({ data: item });
            break;
          default:
            throw new Error(`Unsupported data type: ${dataType}`);
        }
        
        imported.push(result);
      } catch (error) {
        errors.push({
          row: index + 1,
          data: item,
          error: error.message,
        });
      }
    }

    return { imported, errors };
  }

  private async getDataForExport(dataType: DataType, filters?: Record<string, any>) {
    const where = filters || {};

    switch (dataType) {
      case DataType.FINE_STATISTICS:
        return this.prisma.fineStatistics.findMany({ where });
      case DataType.EVACUATION_STATISTICS:
        return this.prisma.evacuationStatistics.findMany({ where });
      case DataType.TRAFFIC_LIGHT_REGISTRY:
        return this.prisma.trafficLightRegistry.findMany({ where });
      case DataType.EVACUATION_ROUTES:
        return this.prisma.evacuationRoute.findMany({ where });
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }

  private generateExcelFile(data: any[], filename?: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private generateCsvFile(data: any[], filename?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = csv.format({ headers: true });
      
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      
      data.forEach(row => stream.write(row));
      stream.end();
    });
  }

  async getColumnMapping(file: Express.Multer.File, dataType: DataType) {
    try {
      let headers: string[];

      if (file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx')) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        headers = data[0] as string[];
      } else {
        const csvData = await this.parseCsvFile(file.buffer);
        headers = Object.keys(csvData[0] || {});
      }

      const dbFields = this.getDbFieldsForDataType(dataType);

      return {
        fileHeaders: headers,
        dbFields,
        suggestedMapping: this.suggestColumnMapping(headers, dbFields),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to analyze file: ${error.message}`);
    }
  }

  private getDbFieldsForDataType(dataType: DataType): string[] {
    switch (dataType) {
      case DataType.FINE_STATISTICS:
        return ['date', 'year', 'violationsDetected', 'decreesIssued', 'finesImposed', 'finesCollected', 'isPublic'];
      case DataType.EVACUATION_STATISTICS:
        return ['date', 'year', 'towTrucksOnLine', 'callouts', 'evacuationsCount', 'impoundLotRevenue', 'isPublic'];
      case DataType.TRAFFIC_LIGHT_REGISTRY:
        return ['registryNumber', 'address', 'lightType', 'installYear', 'status', 'latitude', 'longitude', 'isPublic'];
      case DataType.EVACUATION_ROUTES:
        return ['year', 'month', 'route', 'efficiency', 'isActive'];
      default:
        return [];
    }
  }

  private suggestColumnMapping(fileHeaders: string[], dbFields: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    fileHeaders.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchedField = dbFields.find(field => {
        const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedHeader.includes(normalizedField) || normalizedField.includes(normalizedHeader);
      });
      
      if (matchedField) {
        mapping[header] = matchedField;
      }
    });
    
    return mapping;
  }
}