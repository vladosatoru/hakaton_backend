import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcrypt'

dotenv.config()
const prisma = new PrismaClient()

const createUsers = async (quantity: number) => {
	for (let i = 0; i < quantity; i++) {
		await prisma.user.create({
			data: {
				email: faker.internet.email(),
				name: faker.person.fullName(),
				phone: faker.phone.number('+7 (###) ###-##-##'),
				password: await bcrypt.hash('123456', 5),
				role: i === 0 ? 'ADMIN' : faker.helpers.arrayElement(['GUEST', 'EDITOR']),
			},
		})
	}
	console.log(`Created ${quantity} users`)
}

const createTrafficLights = async (quantity: number) => {
	for (let i = 0; i < quantity; i++) {
		await prisma.trafficLight.create({
			data: {
				address: faker.location.streetAddress(),
				type: faker.helpers.arrayElement(['STANDARD', 'PEDESTRIAN', 'ARROW', 'SMART']),
				status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'BROKEN']),
				installDate: faker.date.past(),
			},
		})
	}
	console.log(`Created ${quantity} traffic lights`)
}

const createFines = async (quantity: number) => {
	for (let i = 0; i < quantity; i++) {
		await prisma.fine.create({
			data: {
				vehicleNumber: faker.vehicle.vrm(),
				violationType: faker.helpers.arrayElement(['speeding', 'parking', 'traffic_light', 'other']),
				amount: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
				date: faker.date.past(),
				location: faker.location.streetAddress(),
				status: faker.helpers.arrayElement(['PENDING', 'PAID', 'CANCELLED', 'OVERDUE']),
			},
		})
	}
	console.log(`Created ${quantity} fines`)
}

const createEvacuations = async (quantity: number) => {
	for (let i = 0; i < quantity; i++) {
		await prisma.evacuation.create({
			data: {
				date: faker.date.past(),
				location: faker.location.streetAddress(),
				vehicleNumber: faker.vehicle.vrm(),
				reason: faker.lorem.sentence(),
				cost: faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
				status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
			},
		})
	}
	console.log(`Created ${quantity} evacuations`)
}

async function main() {
	console.log('Start seeding ...')
	await createUsers(5)
	await createTrafficLights(10)
	await createFines(20)
	await createEvacuations(15)
	console.log('Seeding finished.')
}

main()
	.catch((e) => console.error(e))
	.finally(async () => {
		await prisma.$disconnect()
	})
