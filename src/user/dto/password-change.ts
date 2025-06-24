import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, IsNumber, Length } from "class-validator";
import { UserDto } from "./user.dto";

// CUANDO EL USUARIO QUIERA CAMBIAR LA CONTRASEÑA INGRESARÁ NOMBRE DE USUARIO O CORREO PARA 
// VALIDACIÓN Y ENVÍO DEL CODIGO TEMPORAL
export class RequestUpdatePasswordCodeDto{
	@ApiProperty()
	@IsString()
	usernameOrEmail: string;	
}

// UNA VEZ ENVIADO EL CODIGO, SE DEBE INGRESAR EL CORREO AL QUE FUE ENVIADO DICHO CODIGO
// JUNTO CON EL MISMO
export class ValidateUpdateUserPasswordCodeDto{
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	code: number;
}

// UNA VEZ VALIDADA LA IDENTIDAD DEL USUARIO, SE INGRESARÁ LA NUEVA CONTRASEÑA
export class UpdateUserPasswordDto{
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Length(8, 100)
  newPassword: string;
}

// RESPUESTA AL USUARIO UNA VEZ CAMBIADA LA CONTRASEÑA
export type ResponsetUpdatePasswordCodeDto = {
	status: boolean;
  description: string;
  user?: UserDto | null;
}