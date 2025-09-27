import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'

@Injectable()
export class OnlyAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: any }>()
		const user = request.user

		if (user.role !== 'ADMIN') {
			throw new ForbiddenException("You don't have right! ")
		}
		return user.role === 'ADMIN'
	}
}
