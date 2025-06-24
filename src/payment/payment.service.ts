import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IPaymentPreference, IPaymentPreferenceReq } from './dto/preference-payment';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dto/user.dto';
import { Address } from '../address/entities/address.entity';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseFound } from '../global/responseInterfaces';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {

	constructor(	
		private readonly configService: ConfigService, 
		private readonly userService: UserService,
		private readonly productService: ProductService,
		private readonly emailService: EmailService,
		private readonly orderService: OrderService
	) { }

	CLIENT_DOMAIN = this.configService.get<string>('PROD_CLIENT_DOMAIN');
	ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');
	PUBLIC_KEY = this.configService.get<string>('MP_PUBLIC_KEY');
	CLIENT_ID = this.configService.get<string>('MP_CLIENT_ID');
	CLIENT_SECRET = this.configService.get<string>('MP_CLIENT_SECRET');

	client = new MercadoPagoConfig({ accessToken: this.ACCESS_TOKEN })

	async generatePaymentOrException(preferenceData: IPaymentPreferenceReq, res: Response): Promise<void> {
		const response: IRecourseFound<any> = await this.productService.validateOperation(preferenceData.items);
		if(response.status){
			await this.createPaymentPreference(preferenceData, res);
		}
	}
	async createPaymentPreference(preferenceData: IPaymentPreferenceReq, res: Response) {
    
		const preference = new Preference(this.client)

		const expDataFrom = new Date;

		const expDataTo = new Date(Date.now() + (1000 * 60 * 15));


		const payer: UserDto = (await this.userService.findOneById(preferenceData.userId)).recourse;


		const address: Address = payer.address.find(a => a.id === preferenceData.addressId);
		if(!address){

			const badRequestError: INotFoundEx = { status: false, message: `The id address '${preferenceData.addressId}' not exists in the user register` };
			throw new NotFoundException(badRequestError);
		}

		const preferenceBody: IPaymentPreference = {
				items: preferenceData.items.map((item) => ({
					...item,
					id: item.id.toString()
				})), 
				back_urls: {
					success: `${this.CLIENT_DOMAIN}/payment/result`,
					failure: `${this.CLIENT_DOMAIN}/payment/result`,
					pending: `${this.CLIENT_DOMAIN}/payment/result`
				},
				payer: {
					name: payer?.name,
					surname: payer?.surname,
					email: payer?.email,
					identification: {
						type: payer?.idType?.name,
						number: payer?.idNumber
					},
					address: {
						street_name: address?.addressStreet ?? "",
						street_number: address?.addressNumber ?? "",	
						zip_code: address?.postalCode
					}
				},
				auto_return: "approved",
				payment_methods: {
					excluded_payment_methods: [],
					excluded_payment_types: [
            { id: 'ticket' }
       	  ],
					installments: 12
				},
				notification_url: "",
				statement_descriptor: "PADEL POINT",
				external_reference: "Padel Point",
				expires: true,
				expiration_date_from: expDataFrom?.toISOString(),
				expiration_date_to: expDataTo?.toISOString()
		}
		preference.create({
			body: { ...preferenceBody, }
		})
			.then(async data => {
				const response: IRecourseCreated<string> = {
					status: true,
					message: "The embeded form was created succesfully",
					recourse: data.init_point
				}
				res.json(response);
			})
			.catch(async error => {
				console.error(error);
				const badRequestError: IBadRequestex = {
					status: false,
					message: "Error in the creation of the embeded form"
				}
				throw new BadRequestException(badRequestError);
			});

	}

	// async updateOrderStatusByPaymentId(paymentId: string) {
	// 	const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  //   const response = await fetch(url, {
	// 		method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${this.ACCESS_TOKEN}`,
  //     },
  //   })
	// 	.then(data => data.json())
	// 	.catch((error) => {
	// 		console.error(error);
	// 		const badRequestError: IBadRequestex = {
	// 			status: false,
	// 			message: "Error fetching the payment status by payment id"
	// 		};
	// 		throw new BadRequestException(badRequestError);
	// 	});

  //   const paymentStatus = response.data.status; 

  //   if (paymentStatus === 'approved') {
	//  	console.log(" == Status: APPROVED == ");

	// 		// const order: Order = await this.orderService.
  //   }
	// 	if (paymentStatus === 'pending') {
	// 		console.log(" == Status: PENDING == ");


  //   }
	// 	if (paymentStatus === 'in_process') {
	// 		console.log(" == Status: IN_PROCESS == ");


  //   }
	// 	if (paymentStatus === 'rejected') {
	// 		console.log(" == Status: REJECTED == ");


  //   }
	// 	if (paymentStatus === 'cancelled') {
	// 		console.log(" == Status: CANCELLED == ");


  //   }
	// 	if (paymentStatus === 'refunded') {
	// 		console.log(" == Status: REFUNDED == ");


  //   }
	// 	if (paymentStatus === 'charged_back') {
	// 		console.log(" == Status: CHARGED_BACK == ");


  //   }
  // }

	// Este metodo era unicamente para testear 
	// el estado de la orden por id. Se debe 
	// eliminar al igual que su endpoint
	// async knowStatus(paymentId: number){
	// 	const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  //   const response = await fetch(url, {
	// 		method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${this.ACCESS_TOKEN}`,
  //     },
  //   })
	// 	.then(data => data.json())
	// 	.catch((error) => {
	// 		console.error(error);
	// 		const badRequestError: IBadRequestex = {
	// 			status: false,
	// 			message: "Error fetching the payment status by payment id"
	// 		};
	// 		throw new BadRequestException(badRequestError);
	// 	});

	// 	console.log("PAYMENT STATUS");
	// 	console.log(response.status);
	// }
}