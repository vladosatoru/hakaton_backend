import { Module } from '@nestjs/common';
import { EvacuationRequestsController } from './evacuation-requests.controller';
import { EvacuationRequestsService } from './evacuation-requests.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EvacuationRequestsController],
  providers: [EvacuationRequestsService, PrismaService],
  exports: [EvacuationRequestsService],
})
export class EvacuationRequestsModule {}