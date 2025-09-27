import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export enum DataType {
  FINE_STATISTICS = 'fine_statistics',
  EVACUATION_STATISTICS = 'evacuation_statistics',
  TRAFFIC_LIGHT_REGISTRY = 'traffic_light_registry',
  EVACUATION_ROUTES = 'evacuation_routes',
  NEWS = 'news',
  DOCUMENTS = 'documents',
}

export enum FileFormat {
  XLSX = 'xlsx',
  CSV = 'csv',
}

export class ImportDataDto {
  @IsEnum(DataType)
  dataType: DataType;

  @IsOptional()
  @IsObject()
  columnMapping?: Record<string, string>; // Сопоставление столбцов файла с полями БД
}

export class ExportDataDto {
  @IsEnum(DataType)
  dataType: DataType;

  @IsEnum(FileFormat)
  format: FileFormat;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>; // Фильтры для экспорта

  @IsOptional()
  @IsString()
  filename?: string;
}

export class ColumnMappingDto {
  @IsString()
  fileColumn: string; // Название столбца в файле

  @IsString()
  dbField: string; // Название поля в БД

  @IsOptional()
  @IsString()
  dataType?: string; // Тип данных (string, number, date, boolean)
}