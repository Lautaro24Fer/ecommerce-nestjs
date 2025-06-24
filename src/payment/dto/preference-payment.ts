// Payment preference respo

import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsPositive, IsString } from "class-validator";



// Payment preference request

export class IPaymentPreferenceReq {
    @ApiProperty()
    @IsPositive()
    userId: number;

    @ApiProperty()
    @IsPositive()
    addressId: number;

    @ApiProperty()
    @IsArray()
    items: ItemDto[];
}

// Preference payment

export interface IPaymentPreference {
    items:                Item[];
    payer:                Payer;
    back_urls:            BackUrls;
    auto_return:          string;
    payment_methods:      PaymentMethods;
    notification_url:     string;
    statement_descriptor: string;
    external_reference:   string;
    expires:              boolean;
    expiration_date_from: string;
    expiration_date_to:   string;
}


export interface BackUrls {
    success: string;
    failure: string;
    pending: string;
}

export class ItemDto {

    @ApiProperty()
    @IsPositive()
    id: number;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    currency_id: string;

    @ApiProperty()
    @IsString()
    picture_url?: string | null;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    category_id: string;

    @ApiProperty()
    @IsPositive()
    quantity: number;

    @ApiProperty()
    @IsPositive()
    unit_price: number;
}

export interface Item {
    id: string;
    title: string;
    currency_id: string;
    picture_url?: string | null;
    description: string;
    category_id: string;
    quantity: number;
    unit_price: number;
}

export interface Payer {
    name:           string;
    surname:        string;
    email:          string;
    phone?:          Phone;
    identification: Identification;
    address:        Address;
}

export interface Address {
    street_name:   string;
    street_number: string;
    zip_code:      string;
}

export interface Identification {
    type:   string;
    number: string;
}

export interface Phone {
    area_code: string;
    number:    string;
}

export interface PaymentMethods {
    excluded_payment_methods: ExcludedPayment[];
    excluded_payment_types:   ExcludedPayment[];
    installments:             number;
}

export interface ExcludedPayment {
    id: string;
}
