import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEvacuationRequestDto, UpdateEvacuationRequestDto, EvacuationRequestFilterDto } from './dto/evacuation-request.dto';
import { EvacuationRequestStatus } from '@prisma/client';

@Injectable()
export class EvacuationRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createEvacuationRequestDto: CreateEvacuationRequestDto) {
    // Рассчитываем примерную стоимость на основе типа автомобиля
    const estimatedCost = this.calculateEstimatedCost(createEvacuationRequestDto.vehicleType);

    return this.prisma.evacuationRequest.create({
      data: {
        ...createEvacuationRequestDto,
        estimatedCost: createEvacuationRequestDto.estimatedCost || estimatedCost,
      },
    });
  }

  async findAll(filter?: EvacuationRequestFilterDto) {
    const where: any = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.vehicleType) {
      where.vehicleType = {
        contains: filter.vehicleType,
        mode: 'insensitive',
      };
    }

    if (filter?.address) {
      where.address = {
        contains: filter.address,
        mode: 'insensitive',
      };
    }

    return this.prisma.evacuationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.evacuationRequest.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateEvacuationRequestDto: UpdateEvacuationRequestDto) {
    return this.prisma.evacuationRequest.update({
      where: { id },
      data: updateEvacuationRequestDto,
    });
  }

  async remove(id: number) {
    return this.prisma.evacuationRequest.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: EvacuationRequestStatus) {
    return this.prisma.evacuationRequest.update({
      where: { id },
      data: { status },
    });
  }

  async getStatistics() {
    const total = await this.prisma.evacuationRequest.count();
    
    const byStatus = await this.prisma.evacuationRequest.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const byVehicleType = await this.prisma.evacuationRequest.groupBy({
      by: ['vehicleType'],
      _count: {
        vehicleType: true,
      },
      _avg: {
        estimatedCost: true,
      },
    });

    return {
      total,
      byStatus,
      byVehicleType,
    };
  }

  private calculateEstimatedCost(vehicleType: string): number {
    const baseCost = 5000; // Базовая стоимость
    
    const vehicleTypeMultipliers: Record<string, number> = {
      'легковой': 1.0,
      'внедорожник': 1.2,
      'микроавтобус': 1.5,
      'грузовой': 2.0,
      'автобус': 2.5,
      'мотоцикл': 0.8,
    };

    const normalizedType = vehicleType.toLowerCase();
    const multiplier = vehicleTypeMultipliers[normalizedType] || 1.0;

    return Math.round(baseCost * multiplier);
  }
}