import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateIncidentDto, UpdateIncidentDto } from './incidents.dto'

@Injectable()
export class IncidentsService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateIncidentDto) {
		return this.prisma.incident.create({
			data: {
				type: dto.type as any,
				date: new Date(dto.date),
				location: dto.location,
				description: dto.description,
				severity: (dto.severity as any) || 'LOW',
				status: (dto.status as any) || 'OPEN',
				latitude: dto.latitude,
				longitude: dto.longitude,
				userId: dto.userId,
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
		})
	}

	async findAll(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit
		const [incidents, total] = await Promise.all([
			this.prisma.incident.findMany({
				skip,
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			}),
			this.prisma.incident.count(),
		])

		return {
			incidents,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		}
	}

	async findOne(id: number) {
		return this.prisma.incident.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
		})
	}

	async update(id: number, dto: UpdateIncidentDto) {
		return this.prisma.incident.update({
			where: { id },
			data: {
				...(dto.type && { type: dto.type as any }),
				...(dto.date && { date: new Date(dto.date) }),
				...(dto.location && { location: dto.location }),
				...(dto.description && { description: dto.description }),
				...(dto.severity && { severity: dto.severity as any }),
				...(dto.status && { status: dto.status as any }),
				...(dto.latitude !== undefined && { latitude: dto.latitude }),
				...(dto.longitude !== undefined && { longitude: dto.longitude }),
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
		})
	}

	async remove(id: number) {
		return this.prisma.incident.delete({
			where: { id },
		})
	}

	async getStatistics() {
		const [total, byType, bySeverity, byStatus] = await Promise.all([
			this.prisma.incident.count(),
			this.prisma.incident.groupBy({
				by: ['type'],
				_count: {
					id: true,
				},
			}),
			this.prisma.incident.groupBy({
				by: ['severity'],
				_count: {
					id: true,
				},
			}),
			this.prisma.incident.groupBy({
				by: ['status'],
				_count: {
					id: true,
				},
			}),
		])

		return {
			total,
			byType: byType.map(item => ({
				type: item.type,
				count: item._count.id,
			})),
			bySeverity: bySeverity.map(item => ({
				severity: item.severity,
				count: item._count.id,
			})),
			byStatus: byStatus.map(item => ({
				status: item.status,
				count: item._count.id,
			})),
		}
	}
}
