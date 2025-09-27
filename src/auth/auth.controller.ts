import {
	Body,
	Controller,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe,
	UseGuards,
	Get,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/refreshToken.dto'
import { JwtAuthGuard } from './guards/jwt.guard'
import { RolesGuard } from './guards/roles.guard'
import { Roles } from './decorators/roles.decorator'
import { Public } from './decorators/public.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ summary: 'Регистрация пользователя с полными данными' })
	@ApiResponse({ status: 200, description: 'Пользователь успешно зарегистрирован' })
	@ApiResponse({ status: 400, description: 'Пользователь уже существует' })
	@ApiBody({ type: RegisterDto })
	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@ApiOperation({ summary: 'Быстрая регистрация (только email и пароль)' })
	@ApiResponse({ status: 200, description: 'Пользователь успешно зарегистрирован' })
	@ApiBody({ type: AuthDto })
	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('quick-register')
	async quickRegister(@Body() dto: AuthDto) {
		return this.authService.quickRegister(dto)
	}

	@ApiOperation({ summary: 'Вход в систему' })
	@ApiResponse({ status: 200, description: 'Успешная авторизация' })
	@ApiResponse({ status: 400, description: 'Неверные учетные данные' })
	@ApiBody({ type: AuthDto })
	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: AuthDto) {
		return this.authService.login(dto)
	}

	@ApiOperation({ summary: 'Обновление токена доступа' })
	@ApiResponse({ status: 200, description: 'Токен успешно обновлен' })
	@ApiBody({ type: RefreshTokenDto })
	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(@Body() dto: RefreshTokenDto) {
		return this.authService.getNewTokens(dto.refreshToken)
	}

	@ApiOperation({ summary: 'Получение профиля текущего пользователя' })
	@ApiResponse({ status: 200, description: 'Профиль пользователя' })
	@ApiBearerAuth('JWT-auth')
	@Get('profile')
	async getProfile(@CurrentUser('id') userId: number) {
		return this.authService.getProfile(userId)
	}

	@ApiOperation({ summary: 'Получение списка всех пользователей (только для администратора)' })
	@ApiResponse({ status: 200, description: 'Список пользователей' })
	@ApiResponse({ status: 403, description: 'Недостаточно прав доступа' })
	@ApiBearerAuth('JWT-auth')
	@Roles(UserRole.ADMIN)
	@Get('users')
	async getAllUsers() {
		return this.authService.getAllUsers()
	}
}
