import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFineStatisticsDto, UpdateFineStatisticsDto, FineStatisticsFilterDto } from './dto/fine-statistics.dto';

@Injectable()
export class FineStatisticsService {
  constructor(private prisma: PrismaService) {}

  async create(createFineStatisticsDto: CreateFineStatisticsDto) {
    return this.prisma.fineStatistics.create({
      data: createFineStatisticsDto,
    });
  }

  async findAll(filter?: FineStatisticsFilterDto) {
    const where: any = {};

    if (filter?.year) {
      where.year = filter.year;
    }

    if (filter?.startDate && filter?.endDate) {
      where.date = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }

    if (filter?.isPublic !== undefined) {
      where.isPublic = filter.isPublic;
    }

    return this.prisma.fineStatistics.findMany({
      where,
      orderBy: { date: 'desc' },
      take: filter?.limit || 100,
      skip: filter?.offset || 0,
    });
  }

  async findOne(id: number) {
    return this.prisma.fineStatistics.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateFineStatisticsDto: UpdateFineStatisticsDto) {
    return this.prisma.fineStatistics.update({
      where: { id },
      data: updateFineStatisticsDto,
    });
  }

  async remove(id: number) {
    return this.prisma.fineStatistics.delete({
      where: { id },
    });
  }

  async getAnalytics(year?: number) {
    const where = year ? { year } : {};

    const totalStats = await this.prisma.fineStatistics.aggregate({
      where,
      _sum: {
        violationsDetected: true,
        decreesIssued: true,
        finesImposed: true,
        finesCollected: true,
      },
      _avg: {
        violationsDetected: true,
        decreesIssued: true,
        finesImposed: true,
        finesCollected: true,
      },
    });

    const monthlyStats = await this.prisma.fineStatistics.groupBy({
      by: ['year'],
      where,
      _sum: {
        violationsDetected: true,
        decreesIssued: true,
        finesImposed: true,
        finesCollected: true,
      },
      orderBy: { year: 'desc' },
    });

    return {
      total: totalStats,
      byYear: monthlyStats,
    };
  }

  async compareYears(year1: number, year2: number) {
    const stats1 = await this.prisma.fineStatistics.aggregate({
      where: { year: year1 },
      _sum: {
        violationsDetected: true,
        decreesIssued: true,
        finesImposed: true,
        finesCollected: true,
      },
    });

    const stats2 = await this.prisma.fineStatistics.aggregate({
      where: { year: year2 },
      _sum: {
        violationsDetected: true,
        decreesIssued: true,
        finesImposed: true,
        finesCollected: true,
      },
    });

    return {
      year1: { year: year1, stats: stats1 },
      year2: { year: year2, stats: stats2 },
      comparison: {
        violationsDetectedDiff: (stats2._sum.violationsDetected || 0) - (stats1._sum.violationsDetected || 0),
        decreesIssuedDiff: (stats2._sum.decreesIssued || 0) - (stats1._sum.decreesIssued || 0),
        finesImposedDiff: (stats2._sum.finesImposed || 0) - (stats1._sum.finesImposed || 0),
        finesCollectedDiff: (stats2._sum.finesCollected || 0) - (stats1._sum.finesCollected || 0),
      },
    };
  }
}