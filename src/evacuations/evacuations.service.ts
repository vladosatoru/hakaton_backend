import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEvacuationDto, UpdateEvacuationDto } from './evacuations.dto';

@Injectable()
export class EvacuationsService {
  constructor(private prisma: PrismaService) {}

  async create(createEvacuationDto: CreateEvacuationDto, userId: number) {
    return this.prisma.evacuation.create({
      data: {
        ...createEvacuationDto,
        date: new Date(createEvacuationDto.date),
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.evacuation.findMany({
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
    const evacuation = await this.prisma.evacuation.findUnique({
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

    if (!evacuation) {
      throw new NotFoundException('Evacuation not found');
    }

    return evacuation;
  }

  async update(id: number, updateEvacuationDto: UpdateEvacuationDto) {
    const evacuation = await this.findOne(id);

    return this.prisma.evacuation.update({
      where: { id },
      data: {
        ...updateEvacuationDto,
        date: updateEvacuationDto.date ? new Date(updateEvacuationDto.date) : undefined,
      },
    });
  }

  async remove(id: number) {
    const evacuation = await this.findOne(id);

    return this.prisma.evacuation.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const totalEvacuations = await this.prisma.evacuation.count();
    const totalCost = await this.prisma.evacuation.aggregate({
      _sum: {
        cost: true,
      },
    });
    const completedEvacuations = await this.prisma.evacuation.count({
      where: {
        status: 'COMPLETED',
      },
    });
    const pendingEvacuations = await this.prisma.evacuation.count({
      where: {
        status: 'PENDING',
      },
    });

    return {
      totalEvacuations,
      totalCost: totalCost._sum.cost || 0,
      completedEvacuations,
      pendingEvacuations,
    };
  }
}