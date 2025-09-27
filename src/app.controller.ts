import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Traffic Management API'
    }
  }
}
