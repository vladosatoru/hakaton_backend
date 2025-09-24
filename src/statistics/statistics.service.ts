import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UserService } from '../user/user.service'

@Injectable()
export class StatisticsService {
	constructor(
		private prisma: PrismaService,
		private userService: UserService,
	) {}

	async getMain() {
		const finesCount = await this.prisma.fine.count()
		const evacuationsCount = await this.prisma.evacuation.count()
		const incidentsCount = await this.prisma.incident.count()
		const trafficLightsCount = await this.prisma.trafficLight.count()
		const usersCount = await this.prisma.user.count()
		
		const totalFinesAmount = await this.prisma.fine.aggregate({
			_sum: {
				amount: true,
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
