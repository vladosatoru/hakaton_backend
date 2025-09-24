import { Module } from '@nestjs/common';
import { EvacuationsController } from './evacuations.controller';
import { EvacuationsService } from './evacuations.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EvacuationsController],
  providers: [EvacuationsService, PrismaService],
})
export class EvacuationsModule {}