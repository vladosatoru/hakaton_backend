import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTrafficLightRegistryDto, UpdateTrafficLightRegistryDto, TrafficLightRegistryFilterDto } from './dto/traffic-light-registry.dto';

@Injectable()
export class TrafficLightRegistryService {
  constructor(private prisma: PrismaService) {}

  async create(createTrafficLightRegistryDto: CreateTrafficLightRegistryDto) {
    // Проверяем уникальность номера реестра
    const existingRegistry = await this.prisma.trafficLightRegistry.findUnique({
      where: { registryNumber: createTrafficLightRegistryDto.registryNumber },
    });

    if (existingRegistry) {
      throw new ConflictException('Traffic light with this registry number already exists');
    }

    return this.prisma.trafficLightRegistry.create({
      data: createTrafficLightRegistryDto,
    });
  }

  async findAll(filter?: TrafficLightRegistryFilterDto) {
    const where: any = {};

    if (filter?.lightType) {
      where.lightType = {
        contains: filter.lightType,
        mode: 'insensitive',
      };
    }

    if (filter?.installYear) {
      where.installYear = filter.installYear;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.address) {
      where.address = {
        contains: filter.address,
        mode: 'insensitive',
      };
    }

    if (filter?.isPublic !== undefined) {
      where.isPublic = filter.isPublic;
    }

    return this.prisma.trafficLightRegistry.findMany({
      where,
      orderBy: { registryNumber: 'asc' },
      take: filter?.limit || 100,
      skip: filter?.offset || 0,
    });
  }

  async findOne(id: number) {
    return this.prisma.trafficLightRegistry.findUnique({
      where: { id },
    });
  }

  async findByRegistryNumber(registryNumber: number) {
    return this.prisma.trafficLightRegistry.findUnique({
      where: { registryNumber },
    });
  }

  async update(id: number, updateTrafficLightRegistryDto: UpdateTrafficLightRegistryDto) {
    // Если обновляется номер реестра, проверяем уникальность
    if (updateTrafficLightRegistryDto.registryNumber) {
      const existingRegistry = await this.prisma.trafficLightRegistry.findUnique({
        where: { registryNumber: updateTrafficLightRegistryDto.registryNumber },
      });

      if (existingRegistry && existingRegistry.id !== id) {
        throw new ConflictException('Traffic light with this registry number already exists');
      }
    }

    return this.prisma.trafficLightRegistry.update({
      where: { id },
      data: updateTrafficLightRegistryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.trafficLightRegistry.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const total = await this.prisma.trafficLightRegistry.count();
    
    const byType = await this.prisma.trafficLightRegistry.groupBy({
      by: ['lightType'],
      _count: {
        lightType: true,
      },
    });

    const byStatus = await this.prisma.trafficLightRegistry.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const byInstallYear = await this.prisma.trafficLightRegistry.groupBy({
      by: ['installYear'],
      _count: {
        installYear: true,
      },
      orderBy: { installYear: 'desc' },
    });

    const oldestInstallation = await this.prisma.trafficLightRegistry.findFirst({
      orderBy: { installYear: 'asc' },
      select: { installYear: true, address: true },
    });

    const newestInstallation = await this.prisma.trafficLightRegistry.findFirst({
      orderBy: { installYear: 'desc' },
      select: { installYear: true, address: true },
    });

    return {
      total,
      byType,
      byStatus,
      byInstallYear,
      oldestInstallation,
      newestInstallation,
    };
  }

  async getPublicRegistry(filter?: TrafficLightRegistryFilterDto) {
    return this.findAll({ ...filter, isPublic: true });
  }
}