import { LoginMethodType, MethodPaymentType } from "src/global/enum";

// DATA QUE LLEGA DESDE EL LOGGEO DE OAUTH MEDIANTE PASSPORT A LA API
export interface CreateUserStrategyDto {
  username?: string;
  // Al momento de inicializarse será nulo, luego desde el front create una ventana que le indique al usuario
  // que ingrese su username. Una vez cargado, se actualiza el registro, ya que la idea es hacer este proceso
  // una unica vez ( Cuando el usuario se logea por primera vez )

  password?: string;
  name: string;
  email: string;
  method: LoginMethodType;
  surname: string;
  postalCode?: string;
  idType?: number;
  idNumber?: string;
  addressStreet?: string;
  addressNumber?: string;
}

// AL MOMENTO DE CREAR UN NUEVO USUARIO MEDIANTE OAUTH VERIFICA SI ESTE USUARIO EXISTÍA PREVIAMENTE
// PARA PODER VERIFICAR SI DEBE INGRESAR UN USERNAME
export class AuthUserResponseDto {
  user: object;
  isNewUser: boolean;
}