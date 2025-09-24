import { Module } from '@nestjs/common';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FinesController],
  providers: [FinesService, PrismaService],
})
export class FinesModule {}