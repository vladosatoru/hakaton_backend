import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFineDto, UpdateFineDto } from './fines.dto';

@Injectable()
export class FinesService {
  constructor(private prisma: PrismaService) {}

  async create(createFineDto: CreateFineDto, userId: number) {
    return this.prisma.fine.create({
      data: {
        ...createFineDto,
        date: new Date(createFineDto.date),
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.fine.findMany({
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
    const fine = await this.prisma.fine.findUnique({
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

    if (!fine) {
      throw new NotFoundException('Fine not found');
    }

    return fine;
  }

  async update(id: number, updateFineDto: UpdateFineDto) {
    const fine = await this.findOne(id);

    return this.prisma.fine.update({
      where: { id },
      data: {
        ...updateFineDto,
        date: updateFineDto.date ? new Date(updateFineDto.date) : undefined,
      },
    });
  }

  async remove(id: number) {
    const fine = await this.findOne(id);

    return this.prisma.fine.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const totalFines = await this.prisma.fine.count();
    const totalAmount = await this.prisma.fine.aggregate({
      _sum: {
        amount: true,
      },
    });
    const paidFines = await this.prisma.fine.count({
      where: {
        status: 'PAID',
      },
    });
    const pendingFines = await this.prisma.fine.count({
      where: {
        status: 'PENDING',
      },
    });

    return {
      totalFines,
      totalAmount: totalAmount._sum.amount || 0,
      paidFines,
      pendingFines,
    };
  }
}