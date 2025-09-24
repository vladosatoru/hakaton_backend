import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'

@Module({
	controllers: [DocumentsController],
	providers: [DocumentsService, PrismaService],
	exports: [DocumentsService],
})
export class DocumentsModule {}
