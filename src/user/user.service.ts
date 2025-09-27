import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { UserDto } from './user.dto'
import { PrismaService } from '../prisma.service'
import { returnUserObject } from './return-user.object'
import { Prisma, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async byId(id: number, selectObject?: Prisma.UserSelect) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				...returnUserObject,
				...selectObject,
			},
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	async getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
		})
	}

	async create(data: { email: string; name: string; phone: string; password: string; role?: UserRole }) {
		return this.prisma.user.create({
			data: {
				...data,
				role: data.role || UserRole.GUEST,
			},
		})
	}

	async updateProfile(id: number, dto: UserDto) {
		const isSameUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})

		if (isSameUser && id !== isSameUser.id) {
			throw new BadRequestException('Email already in use')
		}

		const user = await this.prisma.user.update({
			where: { id },
			data: {
				email: dto.email,
				name: dto.name,
				phone: dto.phone,
				password: dto.password ? await bcrypt.hash(dto.password, 5) : undefined,
			},
		})

		return user
	}
}
