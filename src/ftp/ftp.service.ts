import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from "basic-ftp"
import { IBadRequestex } from '../global/responseInterfaces';
import { MulterFile } from '../images/dto/multer-file';
import * as fs from "fs"

@Injectable()
export class FtpService {

  private client: ftp.Client;
  private FTP_SERVER: string;
  private FTP_USER: string;
  private FTP_PASSWORD; string;

  constructor(private readonly configService: ConfigService){
    this.client = new ftp.Client;
    this.client.ftp.verbose = true; // Muestra los logs de la conexion
    this.FTP_SERVER = this.configService.get<string>('FTP_SERVER'),
    this.FTP_USER = this.configService.get<string>('FTP_USER'),
    this.FTP_PASSWORD = this.configService.get<string>('FTP_PASSWORD')
  }

  async checkFileExists(remotePath: string): Promise<boolean> {
    try {
      await this.connectToFTPServer()
      const fileList = await this.client.list(remotePath);
      return fileList.length > 0;
    } catch (error) {
      return false;
    }
    finally{
      await this.closeFTPServerConnection()
    }
  }
  

  async saveImageOnFTPServer(file: MulterFile): Promise<string> {

    if(!file){
      const notFileArrived: IBadRequestex = {
        status: false,
        message: "The file not arrived on the method"
      };
      throw new BadRequestException(notFileArrived)
    }

    const localPath: string = file.path;

    if (!fs.existsSync(localPath)) {
      throw new BadRequestException('Temporary file not found');
    }
    const remotePath: string = `products/${file.filename}`;
    await this.connectToFTPServer();

    try {
      await this.uploadFile(localPath, remotePath);
      return `${this.FTP_SERVER}/${remotePath}`;
    } catch (error) {
      console.error(error);
      const uploadingError: IBadRequestex = {
        status: false,
        message: "Error uploading the arrived image"
      };
      throw new BadRequestException(uploadingError);
    }
    finally{
      await this.closeFTPServerConnection();
      try {
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        } 
        else {
          console.error("El archivo no existe:", localPath);
        }
      } catch (err) {
        console.error();
        const badRequestError: IBadRequestex = {
          status: false,
          message: `"Error eliminando el archivo local: ${err.message}`
        }
        throw new InternalServerErrorException(badRequestError);
      }

    }
    
  }

  async connectToFTPServer() {
    try {
      await this.client.access({
        host: this.FTP_SERVER,
        user: this.FTP_USER,
        password: this.FTP_PASSWORD,
        secure: false
      })
    } catch (error) {
      console.error(error);
      const connectionError: IBadRequestex = {
        status: false,
        message: "Error connecting the FTP server"
      };
      throw new BadRequestException(connectionError);
    }
  }

  async uploadFile(localPath: string, remotePath: string) {
    try {
      const ftpResponse: ftp.FTPResponse = await this.client.uploadFrom(localPath, remotePath);
      return ftpResponse;
    } catch (error) {
      console.error(error);
      const uploadingError: IBadRequestex = {
        status: false,
        message: "Error uploading the files on the FTP server"
      };
      throw new BadRequestException(uploadingError);
    }
  }

  async deleteFile(remotePath: string): Promise<void> {
    try {
      await this.connectToFTPServer();
      const fileExists = await this.client.size(remotePath).catch(() => false);
      if (fileExists) {
        await this.client.remove(remotePath);
      }
    } catch (error) {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error deleting file: ${error.message}`
      }
      throw new BadRequestException(badRequestError);
    } finally {
      await this.closeFTPServerConnection()
    }
  }


  async closeFTPServerConnection() {
    try {
      this.client.close();
    } catch (error) {
      console.error(error);
      const disconnectionError: IBadRequestex = {
        status: false,
        message: "Error in the FTP server disconnection"
      };
      throw new BadRequestException(disconnectionError);
    }
  }
}
