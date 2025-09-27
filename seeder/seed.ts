import {
	PrismaClient,
	UserRole,
	DeviceStatus,
	FineStatus,
	IncidentType,
	IncidentSeverity,
	IncidentStatus,
} from '@prisma/client'
import * as XLSX from 'xlsx'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Starting seeding...')

	// Создаем пользователей с разными ролями
	await seedUsers()

	// Загружаем данные из Excel файла
	await seedFromExcel()

	// Создаем дополнительные тестовые данные
	await seedAdditionalData()

	// Создаем тестовые штрафы
	await seedFines()

	// Создаем тестовые инциденты
	await seedIncidents()

	console.log('✅ Seeding completed successfully!')
}

async function seedUsers() {
	console.log('👥 Seeding users...')

	const users = [
		{
			email: 'admin@codd.ru',
			password: 'admin123',
			name: 'Админ',
			phone: '+7 (481) 234-56-78',
			role: UserRole.ADMIN,
		},
		{
			email: 'editor@codd.ru',
			password: 'editor123',
			name: 'РедакторД',
			phone: '+7 (481) 234-56-79',
			role: UserRole.EDITOR,
		},
		{
			email: 'guest@codd.ru',
			password: 'guest123',
			name: 'Гость',
			phone: '+7 (481) 234-56-80',
			role: UserRole.GUEST,
		},
	]

	for (const user of users) {
		const hashedPassword = await bcrypt.hash(user.password, 5)
		await prisma.user.upsert({
			where: { email: user.email },
			update: {
				password: hashedPassword,
				name: user.name,
				phone: user.phone,
				role: user.role,
			},
			create: {
				...user,
				password: hashedPassword,
			},
		})
	}

	console.log('✅ Users seeded')
}

async function seedFines() {
	console.log('💰 Seeding fines...')

	const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
	if (!admin) return

	// Генерируем случайные штрафы за последние 30 дней
	const fines = []
	const locations = [
		'ул. Ленина, 10',
		'пр. Гагарина, 25',
		'ул. Николаева, 15',
		'пл. Победы, 1',
		'ул. Кирова, 8',
	]
	const violations = [
		'Превышение скорости',
		'Парковка в неположенном месте',
		'Проезд на красный свет',
		'Выезд на встречную полосу',
		'Непропуск пешехода',
	]

	for (let i = 0; i < 100; i++) {
		const date = new Date()
		date.setDate(date.getDate() - Math.floor(Math.random() * 30))

		fines.push({
			violationType: violations[Math.floor(Math.random() * violations.length)],
			amount: Math.floor(Math.random() * 4000) + 1000,
			date,
			location: locations[Math.floor(Math.random() * locations.length)],
			vehicleNumber: `A${Math.floor(Math.random() * 999)}AA67`,
			status: Math.random() > 0.5 ? FineStatus.PAID : FineStatus.PENDING,
			userId: admin.id,
		})
	}

	await prisma.fine.createMany({
		data: fines,
		skipDuplicates: true,
	})

	console.log('✅ Fines seeded')
}

async function seedIncidents() {
	console.log('🚨 Seeding incidents...')

	const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
	if (!admin) return

	const incidents = []
	const locations = [
		'ул. Ленина, 10',
		'пр. Гагарина, 25',
		'ул. Николаева, 15',
		'пл. Победы, 1',
		'ул. Кирова, 8',
	]
	const descriptions = [
		'Столкновение двух автомобилей',
		'Яма на проезжей части',
		'Затор из-за неработающего светофора',
		'Обрыв контактной сети',
		'Плановый ремонт дороги',
	]

	// Создаем инциденты разных типов
	const types = Object.values(IncidentType)
	const severities = Object.values(IncidentSeverity)
	const statuses = Object.values(IncidentStatus)

	for (let i = 0; i < 50; i++) {
		const date = new Date()
		date.setDate(date.getDate() - Math.floor(Math.random() * 30))

		incidents.push({
			type: types[Math.floor(Math.random() * types.length)],
			date,
			location: locations[Math.floor(Math.random() * locations.length)],
			description:
				descriptions[Math.floor(Math.random() * descriptions.length)],
			severity: severities[Math.floor(Math.random() * severities.length)],
			status: statuses[Math.floor(Math.random() * statuses.length)],
			latitude: 54.782635 + (Math.random() - 0.5) * 0.1,
			longitude: 32.045251 + (Math.random() - 0.5) * 0.1,
			userId: admin.id,
		})
	}

	// Создаем больше инцидентов определенных типов для разнообразия статистики
	const criticalIncidents = Array(10)
		.fill(null)
		.map(() => ({
			type: IncidentType.EMERGENCY,
			date: new Date(),
			location: locations[Math.floor(Math.random() * locations.length)],
			description: 'Критическая ситуация на дороге',
			severity: IncidentSeverity.CRITICAL,
			status: IncidentStatus.OPEN,
			latitude: 54.782635 + (Math.random() - 0.5) * 0.1,
			longitude: 32.045251 + (Math.random() - 0.5) * 0.1,
			userId: admin.id,
		}))

	const roadDamageIncidents = Array(15)
		.fill(null)
		.map(() => ({
			type: IncidentType.ROAD_DAMAGE,
			date: new Date(),
			location: locations[Math.floor(Math.random() * locations.length)],
			description: 'Повреждение дорожного полотна',
			severity: IncidentSeverity.MEDIUM,
			status: IncidentStatus.IN_PROGRESS,
			latitude: 54.782635 + (Math.random() - 0.5) * 0.1,
			longitude: 32.045251 + (Math.random() - 0.5) * 0.1,
			userId: admin.id,
		}))

	await prisma.incident.createMany({
		data: [...incidents, ...criticalIncidents, ...roadDamageIncidents],
		skipDuplicates: true,
	})

	console.log('✅ Incidents seeded')
}

async function seedFromExcel() {
	console.log('📊 Loading data from Excel file...')

	try {
		const workbook = XLSX.readFile('./ЦОДД.xlsx')

		// Загружаем статистику штрафов за 2024 год
		await seedFineStatistics(workbook, 'Штрафы 2024', 2024)

		// Загружаем статистику штрафов за 2025 год
		await seedFineStatistics(workbook, 'Штрафы 2025', 2025)

		// Загружаем статистику эвакуации за 2024 год
		await seedEvacuationStatistics(workbook, 'Эвакуация 2024', 2024)

		// Загружаем статистику эвакуации за 2025 год
		await seedEvacuationStatistics(workbook, 'Эвакуация 2025', 2025)

		// Загружаем реестр светофоров
		await seedTrafficLightRegistry(workbook, 'Реестр светофоров')

		// Загружаем маршруты эвакуации
		await seedEvacuationRoutes(workbook, 'Эвакуация маршрут')

		console.log('✅ Excel data loaded')
	} catch (error) {
		console.error('❌ Error loading Excel data:', error.message)
	}
}

async function seedFineStatistics(
	workbook: XLSX.WorkBook,
	sheetName: string,
	year: number,
) {
	console.log(`📈 Seeding fine statistics for ${year}...`)

	const worksheet = workbook.Sheets[sheetName]
	const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

	// Пропускаем заголовки (первые 2 строки)
	const rows = data.slice(2) as any[][]

	let count = 0
	for (const row of rows) {
		if (row.length >= 5 && row[0]) {
			try {
				// Конвертируем Excel дату в JavaScript дату
				const excelDate =
					typeof row[0] === 'number'
						? new Date((row[0] - 25569) * 86400 * 1000)
						: new Date(row[0])

				await prisma.fineStatistics.create({
					data: {
						date: excelDate,
						year,
						violationsDetected: Number(row[1]) || 0,
						decreesIssued: Number(row[2]) || 0,
						finesImposed: Number(row[3]) || 0,
						finesCollected: Number(row[4]) || 0,
						isPublic: true,
					},
				})
				count++
			} catch (error) {
				console.warn(`⚠️ Skipping row ${count + 3}: ${error.message}`)
			}
		}
	}

	console.log(`✅ Created ${count} fine statistics records for ${year}`)
}

async function seedEvacuationStatistics(
	workbook: XLSX.WorkBook,
	sheetName: string,
	year: number,
) {
	console.log(`🚛 Seeding evacuation statistics for ${year}...`)

	const worksheet = workbook.Sheets[sheetName]
	const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

	const rows = data.slice(2) as any[][]

	let count = 0
	for (const row of rows) {
		if (row.length >= 5 && row[0]) {
			try {
				const excelDate =
					typeof row[0] === 'number'
						? new Date((row[0] - 25569) * 86400 * 1000)
						: new Date(row[0])

				await prisma.evacuationStatistics.create({
					data: {
						date: excelDate,
						year,
						towTrucksOnLine: Number(row[1]) || 0,
						callouts: Number(row[2]) || 0,
						evacuationsCount: Number(row[3]) || 0,
						impoundLotRevenue: Number(row[4]) || 0,
						isPublic: true,
					},
				})
				count++
			} catch (error) {
				console.warn(`⚠️ Skipping row ${count + 3}: ${error.message}`)
			}
		}
	}

	console.log(`✅ Created ${count} evacuation statistics records for ${year}`)
}

async function seedTrafficLightRegistry(
	workbook: XLSX.WorkBook,
	sheetName: string,
) {
	console.log('🚦 Seeding traffic light registry...')

	const worksheet = workbook.Sheets[sheetName]
	const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

	const rows = data.slice(1) as any[][]

	let count = 0
	for (const row of rows) {
		if (row.length >= 4 && row[0]) {
			try {
				await prisma.trafficLightRegistry.create({
					data: {
						registryNumber: Number(row[0]),
						address: String(row[1]),
						lightType: String(row[2]),
						installYear: Number(row[3]),
						status: DeviceStatus.ACTIVE,
						isPublic: true,
					},
				})
				count++
			} catch (error) {
				console.warn(`⚠️ Skipping traffic light ${row[0]}: ${error.message}`)
			}
		}
	}

	console.log(`✅ Created ${count} traffic light registry records`)
}

async function seedEvacuationRoutes(
	workbook: XLSX.WorkBook,
	sheetName: string,
) {
	console.log('🗺️ Seeding evacuation routes...')

	const worksheet = workbook.Sheets[sheetName]
	const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

	const rows = data.slice(3) as any[][]

	let count = 0
	for (const row of rows) {
		if (row.length >= 3 && row[0] && row[1] && row[2]) {
			try {
				await prisma.evacuationRoute.create({
					data: {
						year: Number(row[0]),
						month: String(row[1]),
						route: String(row[2]),
						efficiency: Math.random() * 100, // Случайная эффективность для демонстрации
						isActive: true,
					},
				})
				count++
			} catch (error) {
				console.warn(`⚠️ Skipping route: ${error.message}`)
			}
		}
	}

	console.log(`✅ Created ${count} evacuation route records`)
}

async function seedAdditionalData() {
	console.log('📝 Seeding additional data...')

	// Создаем категории контента
	const categories = [
		{ name: 'Новости', description: 'Новости ЦОДД', isPublic: true },
		{ name: 'Документы', description: 'Официальные документы', isPublic: true },
		{ name: 'Отчеты', description: 'Отчеты и аналитика', isPublic: false },
	]

	for (const category of categories) {
		await prisma.contentCategory.upsert({
			where: { name: category.name },
			update: {},
			create: category,
		})
	}

	// Создаем тестовые новости
	const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
	if (admin) {
		const newsCategory = await prisma.contentCategory.findFirst({
			where: { name: 'Новости' },
		})

		const news = [
			{
				title: 'Обновление системы видеофиксации нарушений',
				content:
					'В рамках модернизации дорожной инфраструктуры установлены новые камеры видеофиксации...',
				excerpt: 'Установлены новые камеры видеофиксации',
				published: true,
				publishDate: new Date(),
				authorId: admin.id,
				categoryId: newsCategory?.id,
			},
			{
				title: 'Статистика работы эвакуационной службы за месяц',
				content:
					'За прошедший месяц эвакуационная служба выполнила более 900 выездов...',
				excerpt: 'Отчет о работе эвакуационной службы',
				published: true,
				publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				authorId: admin.id,
				categoryId: newsCategory?.id,
			},
		]

		for (const newsItem of news) {
			await prisma.news.create({ data: newsItem })
		}
	}

	// Создаем тестовые заявки на эвакуацию
	const evacuationRequests = [
		{
			address: 'ул. Большая Советская, 15',
			vehicleType: 'легковой',
			contactName: 'Иван Петров',
			contactPhone: '+7 (481) 123-45-67',
			estimatedCost: 5000,
			notes: 'Автомобиль припаркован на тротуаре',
		},
		{
			address: 'пр-т Гагарина, 25',
			vehicleType: 'внедорожник',
			contactName: 'Мария Сидорова',
			contactPhone: '+7 (481) 234-56-78',
			estimatedCost: 6000,
			notes: 'Блокирует проезд',
		},
	]

	for (const request of evacuationRequests) {
		await prisma.evacuationRequest.create({ data: request })
	}

	// Создаем контактную информацию
	const contacts = [
		{
			department: 'Центр организации дорожного движения',
			address: 'г. Смоленск, ул. Центральная, 1',
			phone: '+7 (481) 200-00-00',
			email: 'info@codd-smolensk.ru',
			workingHours: 'Пн-Пт: 9:00-18:00',
			isPublic: true,
		},
		{
			department: 'Служба эвакуации',
			address: 'г. Смоленск, ул. Промышленная, 5',
			phone: '+7 (481) 200-01-01',
			email: 'evacuation@codd-smolensk.ru',
			workingHours: 'Круглосуточно',
			isPublic: true,
		},
	]

	for (const contact of contacts) {
		await prisma.contact.create({ data: contact })
	}

	console.log('✅ Additional data seeded')
}

main()
	.catch(e => {
		console.error('❌ Seeding failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
