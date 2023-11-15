import { Injectable } from '@nestjs/common';
import { glob } from 'glob';

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}

	async getFile() {
		const jsfiles = await glob('**/*.ts', { ignore: 'node_modules/**' });
		console.log(jsfiles);
	}
}
