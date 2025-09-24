import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { DocumentsModule } from './documents/documents.module'
import { EvacuationsModule } from './evacuations/evacuations.module'
import { FinesModule } from './fines/fines.module'
import { IncidentsModule } from './incidents/incidents.module'
import { NewsModule } from './news/news.module'
import { StatisticsModule } from './statistics/statistics.module'
import { TrafficLightsModule } from './traffic-lights/traffic-lights.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: `${path}/uploads`,
			serveRoot: '/uploads',
		}),
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		StatisticsModule,
		TrafficLightsModule,
		FinesModule,
		EvacuationsModule,
		IncidentsModule,
		NewsModule,
		DocumentsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
