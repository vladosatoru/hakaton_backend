import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Email пользователя', 
    example: 'user@codd.ru' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Пароль (минимум 6 символов)', 
    example: 'password123',
    minLength: 6 
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ 
    description: 'Полное имя пользователя', 
    example: 'Иван Петров' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Номер телефона', 
    example: '+7 (481) 234-56-78',
    required: false 
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    description: 'Роль пользователя', 
    enum: UserRole,
    default: UserRole.GUEST,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.GUEST;
}