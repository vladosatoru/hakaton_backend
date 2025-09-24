import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UserDto {
	@IsEmail()
	email: string

	@IsOptional()
	@IsString()
	password?: string

	@IsString()
	name: string

	@IsOptional()
	@IsString()
	phone?: string
}
