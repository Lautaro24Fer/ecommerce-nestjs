export class MulterFile { // No recnococia el tipo Express.Multer.File asi que lo definí manualmente
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}