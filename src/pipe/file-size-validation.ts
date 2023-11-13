import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as mime from 'mime-types';

interface UploadedFile {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
}

const JPEG_MAGIC_NUMBER: number = 0xffd8;

function isJPEGFile(file: UploadedFile): boolean {
	const firstByte = file.buffer[0];
	const secondByte = file.buffer[1];

	return firstByte === JPEG_MAGIC_NUMBER >> 8 && secondByte === (JPEG_MAGIC_NUMBER & 0xff);
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
	transform(value: any, _: ArgumentMetadata) {
		console.log(mime.contentType(value.originalname));
		const isMimeType = mime.contentType(value.originalname) === `text/plain; charset=utf-8`;
		console.log('isJPEGFile: ', isJPEGFile(value));
		const oneKb = 1000;
		const sizeMessage = `Размер не превышает ${oneKb}Кб: ${value.size < oneKb}`;
		const fileTypeMessage = `Фаил имеет допустимый тип: ${isMimeType}`;
		return ` ${sizeMessage} ${fileTypeMessage}`;
	}
}
