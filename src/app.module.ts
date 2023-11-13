import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserMiddleware } from './middleware/user.middleware';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes('/upload');
		consumer.apply(UserMiddleware).forRoutes('/upload-pipe-bilder');
		consumer.apply(UserMiddleware).forRoutes('/files');
	}
}
