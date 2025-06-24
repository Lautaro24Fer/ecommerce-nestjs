export interface IMercadoPagoAPIResponseOK {
  id:                number;
  wallet_payment:    WalletPayment;
  payments:          Payment[];
  disbursements:     Disbursements;
  payer:             Payer;
  site_id:           string;
  date_created:      Date;
  date_last_updated: Date;
}

export interface Disbursements {
  collector_id: string;
}

export interface Payer {
  id: number;
}

export interface Payment {
  id:                 number;
  status_detail:      string;
  payment_method_id:  string;
  transaction_amount: number;
  installments:       number;
  description:        string;
  capture:            boolean;
  external_reference: string;
}

export interface WalletPayment {
  transaction_amount: number;
  description:        string;
  external_reference: string;
}


export interface IMercadoPagoAPIResponseNotFound {
  status:  string;
  error:   string;
  message: string;
}

