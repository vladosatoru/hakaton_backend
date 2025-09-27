import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthDto } from './dto/auth.dto'
import { RegisterDto } from './dto/register.dto'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { UserRole } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private userService: UserService,
	) {}

	async register(dto: RegisterDto) {
		const existUser = await this.userService.getByEmail(dto.email)

		if (existUser) {
			throw new BadRequestException('User already exist')
		}
		const user = await this.userService.create({
			email: dto.email,
			name: dto.name,
			phone: dto.phone || faker.phone.number('+7 (###) ###-##-##'),
			password: await bcrypt.hash(dto.password, 5),
			role: dto.role || UserRole.GUEST,
		})
		const tokens = await this.issueTokens(user.id)
		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	// Метод для быстрой регистрации (совместимость с существующим API)
	async quickRegister(dto: AuthDto) {
		const registerDto: RegisterDto = {
			email: dto.email,
			password: dto.password,
			name: faker.person.firstName(),
			phone: faker.phone.number('+7 (###) ###-##-##'),
			role: UserRole.GUEST,
		}
		return this.register(registerDto)
	}

	private async issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h',
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d',
		})
		return { accessToken, refreshToken }
	}

	private returnUserFields(user: any) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			phone: user.phone,
			role: user.role,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}
	}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokens(user.id)
		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const user = await this.userService.byId(result.id)
		const tokens = await this.issueTokens(result.id)
		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	async getProfile(userId: number) {
		const user = await this.userService.byId(userId)
		return this.returnUserFields(user)
	}

	async getAllUsers() {
		const users = await this.prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		})
		return users
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user) {
			throw new BadRequestException('User not found')
		}
		const isValid = await bcrypt.compare(dto.password, user.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')
		return user
	}
}
