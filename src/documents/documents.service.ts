import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateDocumentDto, DocumentCategory, UpdateDocumentDto } from './documents.dto'

@Injectable()
export class DocumentsService {
	constructor(private prisma: PrismaService) {}

	async create(createDocumentDto: CreateDocumentDto) {
		return this.prisma.document.create({
			data: {
				title: createDocumentDto.title,
				description: createDocumentDto.description,
				fileName: createDocumentDto.fileName,
				filePath: createDocumentDto.filePath,
				fileSize: createDocumentDto.fileSize,
				fileType: createDocumentDto.fileType,
				category: createDocumentDto.category as any,
				authorId: createDocumentDto.authorId,
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

	async findAll(category?: DocumentCategory) {
		const where = category ? { category: category as any } : {}
		
		return this.prisma.document.findMany({
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
		const document = await this.prisma.document.findUnique({
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

		if (!document) {
			throw new NotFoundException(`Document with ID ${id} not found`)
		}

		return document
	}

	async update(id: number, updateDocumentDto: UpdateDocumentDto) {
		await this.findOne(id)

		return this.prisma.document.update({
			where: { id },
			data: {
				title: updateDocumentDto.title,
				description: updateDocumentDto.description,
				category: updateDocumentDto.category,
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
		return this.prisma.document.delete({
			where: { id },
		})
	}

	async getStatistics() {
		const [total, byCategory] = await Promise.all([
			this.prisma.document.count(),
			this.prisma.document.groupBy({
				by: ['category'],
				_count: {
					category: true,
				},
			}),
		])

		return {
			total,
			byCategory: byCategory.reduce((acc, item) => {
				acc[item.category] = item._count.category
				return acc
			}, {} as Record<string, number>),
		}
	}
}