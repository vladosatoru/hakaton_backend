import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateNewsDto, UpdateNewsDto } from './news.dto'

@Injectable()
export class NewsService {
	constructor(private prisma: PrismaService) {}

	async create(createNewsDto: CreateNewsDto) {
		return this.prisma.news.create({
			data: {
				title: createNewsDto.title,
				content: createNewsDto.content,
				excerpt: createNewsDto.summary,
				imageUrl: createNewsDto.imageUrl,
				published: createNewsDto.isPublished ?? false,
				publishDate: createNewsDto.publishedAt
					? new Date(createNewsDto.publishedAt)
					: null,
				authorId: createNewsDto.authorId,
			},
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
		})
	}

	async findAll(published?: boolean) {
		const where = published !== undefined ? { published: published } : {}

		return this.prisma.news.findMany({
			where,
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	}

	async findOne(id: number) {
		const news = await this.prisma.news.findUnique({
			where: { id },
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
		})

		if (!news) {
			throw new NotFoundException(`News with ID ${id} not found`)
		}

		return news
	}

	async update(id: number, updateNewsDto: UpdateNewsDto) {
		const existingNews = await this.findOne(id)

		return this.prisma.news.update({
			where: { id },
			data: {
				title: updateNewsDto.title,
				content: updateNewsDto.content,
				excerpt: updateNewsDto.summary,
				imageUrl: updateNewsDto.imageUrl,
				published: updateNewsDto.isPublished,
				publishDate: updateNewsDto.publishedAt
					? new Date(updateNewsDto.publishedAt)
					: existingNews.publishDate,
			},
			include: {
				author: {
					select: {
						id: true,
						email: true,
						role: true,
					},
				},
			},
		})
	}

	async remove(id: number) {
		await this.findOne(id)
		return this.prisma.news.delete({
			where: { id },
		})
	}

	async getStatistics() {
		const [total, published, unpublished] = await Promise.all([
			this.prisma.news.count(),
			this.prisma.news.count({ where: { published: true } }),
			this.prisma.news.count({ where: { published: false } }),
		])

		return {
			total,
			published,
			unpublished,
		}
	}
}
