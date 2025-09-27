import { Module } from '@nestjs/common';
import { FineStatisticsController } from './fine-statistics.controller';
import { FineStatisticsService } from './fine-statistics.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FineStatisticsController],
  providers: [FineStatisticsService, PrismaService],
  exports: [FineStatisticsService],
})
export class FineStatisticsModule {}