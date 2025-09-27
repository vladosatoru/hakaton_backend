import { Module } from '@nestjs/common';
import { TrafficLightRegistryController } from './traffic-light-registry.controller';
import { TrafficLightRegistryService } from './traffic-light-registry.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TrafficLightRegistryController],
  providers: [TrafficLightRegistryService, PrismaService],
  exports: [TrafficLightRegistryService],
})
export class TrafficLightRegistryModule {}