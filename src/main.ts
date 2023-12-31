import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const port = 3003;
	const app = await NestFactory.create(AppModule);
	await app.listen(port);
	console.log(`File Test Port:${port}`);
}
bootstrap();
