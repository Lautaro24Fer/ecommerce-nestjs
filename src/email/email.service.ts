import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendService } from 'nestjs-resend';
import { Resend } from 'resend';
import { resetPasswordLayout } from './layouts/change-password-code';
import * as nodemailer from 'nodemailer';
import { IBadRequestex, IRecourseCreated } from '../global/responseInterfaces';
import { Order } from '../order/entities/order.entity';
import createOrderLayout from './layouts/order';
import { OrderDto } from '../order/dto/order.dto';

@Injectable()
export class EmailService {

	transporter: nodemailer.Transporter;
	NODEMAILER_HOST: string;
	NODEMAILER_PORT: number;
	NODEMAILER_USER: string;
	NODEMAILER_PASSWORD: string;
	NODEMAILER_ADMIN_MAIL: string;

  constructor(private readonly configService: ConfigService) {

		this.NODEMAILER_HOST = configService.get<string>('NM_HOST');
		this.NODEMAILER_PORT = configService.get<number>('NM_PORT');
		this.NODEMAILER_USER = configService.get<string>('NM_USER');
		this.NODEMAILER_PASSWORD = configService.get<string>('NM_PASSWORD');
		this.NODEMAILER_ADMIN_MAIL = configService.get<string>('NM_ADMIN_MAIL');

		this.transporter = nodemailer.createTransport({
			host: this.NODEMAILER_HOST,
			port: this.NODEMAILER_PORT, 
			secure: true, 
			auth: {
				user: this.NODEMAILER_USER, 
				pass: this.NODEMAILER_PASSWORD,
			},
			tls: {
				rejectUnauthorized: false, // Permitir certificados no válidos (útil para servidores internos)
			},
		});
	}
	
	async sendEmailForOrder(order: Order): Promise<IRecourseCreated<any>> {
		const layout: string = createOrderLayout(order);


		const info: IRecourseCreated<any> = await this.transporter.sendMail({
			from: `no reply <${this.NODEMAILER_USER}>`,
			to: [this.NODEMAILER_ADMIN_MAIL], // TODO: Mail de nacho
			subject: "Padel point - Nueva orden de pago", // Asunto
			html: layout
		}).then((data) => {
			const recourseCreated: IRecourseCreated<any> = {
				status: true,
				message: "The order mail was sended succesfully to the admin",
				recourse: data
			};
			return recourseCreated;
		})
		.catch((error) => {
			console.error(" *** EMAIL ERROR***")
			console.error(error);
			const badRequestError: IBadRequestex = {
				status: false,
				message: "Error sending the order email to the admin"
			};
			throw new BadRequestException(badRequestError);
		});
		return info;
	}

	async sendEmailForResetPassword(token: number, toUser: string){


		const layout: string = resetPasswordLayout(token);

		const info: IRecourseCreated<any> = await this.transporter.sendMail({
			from: `no reply <${this.NODEMAILER_USER}>`,
			to: [toUser],
			subject: "Padel point - Reset password code", // Asunto
			html: layout
		}).then((data) => {
			const recourseCreated: IRecourseCreated<any> = {
				status: true,
				message: "The reset password mail was sended succesfully",
				recourse: data
			};
			return recourseCreated;
		}).catch((error) => {
			console.error(error);
			const badRequestError: IBadRequestex = {
				status: false,
				message: "The reset password mail was not sended. An error ocurred"
			};
			throw new BadRequestException(badRequestError);
		});
		return info;
	}

}


