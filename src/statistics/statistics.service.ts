import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class StatisticsService {
	constructor(private prisma: PrismaService) {}

	async getMain() {
		// Получаем общую статистику
		const [
			finesCount,
			evacuationsCount,
			incidentsCount,
			trafficLightsCount,
			usersCount,
			totalFinesAmount,
		] = await Promise.all([
			this.prisma.fine.count(),
			this.prisma.evacuation.count(),
			this.prisma.incident.count(),
			this.prisma.trafficLight.count(),
			this.prisma.user.count(),
			this.prisma.fine.aggregate({
				_sum: {
					amount: true,
				},
			}),
		])

		// Сохраняем статистику
		await this.prisma.statistics.create({
			data: {
				date: new Date(),
				finesCount,
				finesAmount: totalFinesAmount._sum.amount || 0,
				evacuationsCount,
				incidentsCount,
				trafficLightsActive: trafficLightsCount,
			},
		})

		return [
			{
				name: 'Fines',
				value: finesCount,
			},
			{
				name: 'Evacuations',
				value: evacuationsCount,
			},
			{
				name: 'Incidents',
				value: incidentsCount,
			},
			{
				name: 'Traffic Lights',
				value: trafficLightsCount,
			},
			{
				name: 'Users',
				value: usersCount,
			},
			{
				name: 'Total Fines Amount',
				value: totalFinesAmount._sum.amount || 0,
			},
		]
	}
}
