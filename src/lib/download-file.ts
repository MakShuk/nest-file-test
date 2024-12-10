import axios from 'axios';
import fs from 'fs';
import { join } from 'path';

export async function downloadFile(url: string) {
	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream',
	});

	const filePath = join(process.cwd(), `/upload/files/save.jpg`);

	return new Promise((resolve, reject) => {
		response.data
			.pipe(fs.createWriteStream(filePath))
			.on('finish', () => resolve('OK'))
			.on('error', (e: any) => reject(e));
	});
}
