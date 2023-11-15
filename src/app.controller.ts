import {
	Body,
	Controller,
	Get,
	HttpStatus,
	ParseFilePipe,
	ParseFilePipeBuilder,
	Post,
	Query,
	Res,
	StreamableFile,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
	UsePipes,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './pipe/file-size-validation';
import { MaxFileSize } from './pipe/validation';
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { AppService } from './app.service';

const UPLOAD_DIR = './upload/files/';
const MAX_UPLOAD_SIZE = 10; // in MB
const MAX_FILES_COUNT = 10;

interface User {
	id: string;
}

const defaultConfig = diskStorage({
	destination: UPLOAD_DIR,
	filename: (req: Request & { user: User }, file, cb) => {
		const uid = req.user.id;
		cb(null, `${uid}-${new Date().getTime()}.${file.originalname.split('.').pop()}`);
	},
});

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('upload-image')
	@UseInterceptors(FileInterceptor('file'))
	uploadImageFile(@UploadedFile() file: Express.Multer.File) {
		if (!file.mimetype.startsWith('image')) {
			return { error: 'Invalid file type. Please upload an image.' };
		}
		console.log(file);
		return file.filename;
	}

	@Post('upload-min-size')
	@UsePipes(FileSizeValidationPipe)
	@UseInterceptors(FileInterceptor('file'))
	uploadMinSizeFile(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
		return file;
	}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', { storage: defaultConfig }))
	uploadFileAndValidation(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSize({
						maxSize: MAX_UPLOAD_SIZE,
					}),
				],
			}),
		)
		file: Express.Multer.File,
		@Body() body: any,
	) {
		return [body, file];
	}

	@Post('upload-pipe-bilder')
	@UseInterceptors(FileInterceptor('file', { storage: defaultConfig }))
	uploadFile(
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: /(jpg|jpeg|png|gif)$/,
				})
				.addMaxSizeValidator({
					maxSize: 1000,
				})
				.addValidator(
					new MaxFileSize({
						maxSize: MAX_UPLOAD_SIZE,
					}),
				)
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
	) {
		console.log(file);
	}

	@Post('files')
	@UseInterceptors(FilesInterceptor('files', MAX_FILES_COUNT, { storage: defaultConfig }))
	uploadFiles(
		@UploadedFiles(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: /(jpg|jpeg|png|gif)$/,
				})
				.addValidator(
					new MaxFileSize({
						maxSize: MAX_UPLOAD_SIZE,
					}),
				)
				.build({
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		files: Express.Multer.File[],
	) {
		console.log(files);
	}

	@Get('img')
	async getFile(
		@Res({ passthrough: true }) res: Response,
		@Query() queryParams: { folder: string; id: string },
	) {
		res.set({
			'Content-Type': 'image/jpeg',
			'Content-Disposition': 'attachment; filename="1.jpg"',
		});

		const path = `/resources/${queryParams.folder}/${queryParams.id}.jpg`;
		const filePath = join(process.cwd(), path);
		await this.appService.getFile();

		try {
			const stats = await new Promise((resolve, reject) => {
				fs.stat(filePath, (err, stats) => {
					if (err) {
						reject(err);
					} else {
						resolve(stats);
					}
				});
			});

			if (!stats) {
				return res.status(404).send('File not found');
			}

			const file = fs.createReadStream(join(process.cwd(), path));
			return new StreamableFile(file);
		} catch (err) {
			return res.status(404).send('File reading error');
		}
	}
}
