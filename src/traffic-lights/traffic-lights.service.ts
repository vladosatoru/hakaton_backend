import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTrafficLightDto, UpdateTrafficLightDto } from './traffic-lights.dto';

@Injectable()
export class TrafficLightsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrafficLightDto, userId?: number) {
    return this.prisma.trafficLight.create({
      data: {
        ...dto,
        installDate: new Date(dto.installDate),
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.trafficLight.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const trafficLight = await this.prisma.trafficLight.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!trafficLight) {
      throw new NotFoundException('Traffic light not found');
    }

    return trafficLight;
  }

  async update(id: number, dto: UpdateTrafficLightDto) {
    await this.findOne(id);

    const updateData: any = { ...dto };
    if (dto.lastMaintenance) {
      updateData.lastMaintenance = new Date(dto.lastMaintenance);
    }

    return this.prisma.trafficLight.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.trafficLight.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const total = await this.prisma.trafficLight.count();
    const active = await this.prisma.trafficLight.count({
      where: { status: 'ACTIVE' },
    });
    const maintenance = await this.prisma.trafficLight.count({
      where: { status: 'MAINTENANCE' },
    });
    const broken = await this.prisma.trafficLight.count({
      where: { status: 'BROKEN' },
    });

    return {
      total,
      active,
      maintenance,
      broken,
    };
  }
}