import { Module } from '@nestjs/common';
import { TrafficLightsController } from './traffic-lights.controller';
import { TrafficLightsService } from './traffic-lights.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TrafficLightsController],
  providers: [TrafficLightsService, PrismaService],
  exports: [TrafficLightsService],
})
export class TrafficLightsModule {}