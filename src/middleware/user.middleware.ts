import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Request } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
	use(req: Request & { user: { id: string } }, _: Response, next: NextFunction) {
		console.log('UserMiddleware');
		if (req.headers && typeof req.headers.user === 'string' && req.headers.user.length > 0) {
			const uid = req.headers.user;
			req;
			req.user = {
				id: uid,
			};
			console.log('UserMiddleware END');
			next();
		} else {
			throw new Error(`В заголовке отсутсвут пользователь`);
		}
	}
}
