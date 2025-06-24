<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# PadelPoint v1.2

## Levantar servidor

```bash
$ npm run start:dev
```

Por defecto se levanta en el puerto 3000

## Base de datos

La conexión a la base de datos parte de dos puntos principales en el proyecto que en escencia son el mismo concepto, el datasource.
Dentro del proyecto vas a encontrarte dos veces la misma configuración del datasource que van con funciones distintas

```typescrypt

app.module.ts

TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'nest',
      entities: [Brand, Order, Product, Supplier, User],
      synchronize: false,
    }),

orm-config.ts

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'nest',
  synchronize: false,
  logging: false,
  entities: [User, Brand, Order, Product, Supplier], // Ajusta según tus entidades
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

```

Uno es para darle a entender a nest el 'contexto' de la base de datos y el otro es una configuracion para typeorm para la creacion de las interfaces. Esto es lo de menos, lo importante es que cambies las credenciales por las tuyas que vayas a usar en local hasta que cambiemos a produccion. Principalmente el username, password y la database son las principales credenciales que varian en local. Asi que lo de siempre, vas a tener que tener un entorno para ejecutar la db en mysql (MySql Workbench, DBeaver, el que sea), crees tanto el usuario como una base para conectarse y cambies las credenciales.
El resto dejalo como está, no debe tener mas problemas para conectarse a partir de acá

## Migrations

Para generar la migración se debe tipear el siguiente comando en consola

```bash
# path: Lugar del proyecto donde se guarda la migracion. Por ejemplo puede ser ./src/migrations/(nombremigracion) hace esa por las dudas xd
$ npm run migration:generate -- path*
```

Para ejecutar la migracion y llevarla a la db se debe hacer lo siguiente

```bash
# Se guardará en la base configurada en el datasource
$ npm run migration:run
```

Una vez creada y ejecutada la migración se crearán las tablas, por defecto de voy a dejar una migracion que por defecto crean un par de marcas, un par de provedores y 5 productos con una imagen de prueba. Tené en cuenta que si creas una migracion nueva no vas a tener registros cargados y vas a tener que cargar productos a mano.

## Endpoints

No voy a detallar mucho acerca de los endpoints ya que está todo en swagger, por lo que podrás hacerte cuenta por como viene la mano. Lo unico que te voy a decir es que vas a poder acceder a todos los controladores a excepcion de las ordenes de compra, opté por dejarlas para versionado posterior. Pero en lo que es productos, marcas y provedores vas a poder crear, actualizar y eliminar sin problemas.
Cabe destacar que todas estas operaciones son publicas por defecto asi que servirá para dar forma en el frontend de una forma mas sencilla, con el tiempo iremos añadiendo roles para limitar el acceso

## Auth / Users

Los usuarios es mas de lo mismo, se podra registrar, actualizar todos los campos (incluida la contraseña) pero no lo unico que no vas a poder será eliminar usuarios. Para eso requerirás iniciar sesión (en algun lado tenia que meter el auth ajajaj)
Los inicios de sesión son mediante cookies, esto facilita que no tengas que poner el token en el header.
Por defecto los tokens duran 30 minutos, por lo que cuando inicies sesion tendras permisos durante ese tiempo para hacer las peticiones.

Para iniciar sesion tenes que ingresar el nombre de usuario y la contraseña

## OAUTH

Para el inicio de sesión lo unico que hay que hacer es crear un boton que tenga el siguiente codigo

```typescript
// La url cambiará cuando la api esté en produccion

const buttonEl = document.querySelector('#googlebtn');
buttonEl.addEventListener('click', () => {
  window.location.href = 'http://localhost:3000/auth/login/google';
});
```

Al momento de aceptar las credenciales se devolverá en forma de cookie la id del usuario ya que por fines de seguridad prefiero que hagas 2 fetch a la api para tener toda la informacion del usuario.

Cuadndo el usuario se logeea por primera vez naturalmente no tendrá nombre de usuario, teniendo un nombre de usuario similar a este

```bash
# El numero es aleatorio conseguido con ${Date.now() + 1}

username.null.14183741680
```

Es acá en donde debería manejarse desde el front el cambio de nombre de usuario.

## QUERY PARAMS

El controlador de productos proverá la funcionalidad de filtrar mediante parametros de consulta en la url para traer varios productos. Se va a poder filtrar en funcion de:

- Precio mínimo (minPrice)
- Precio máximo (maxPrice)
- Precio exacto (price)
- Nombre de producto (name)
- Nombre de marca (brand)
- Limite de cantidad de productos retornados (limit)

Naturalmente todo lo relacionado a precios será de tipo numérico positivo, los casos de los mínimos y los máximos serán limites inclusives (menor o igual, mayor o igual). El caso de los nombres al ser cadenas harán uso de expresiones regulares para encontrar las similitudes con bipolaridad

```typescript
// Busca similitudes en ambas direcciones, si empieza, en el medio o termina

`%${cadena}%`;
```

Un ejemplo de uso sería algo así

```bash

http://localhost:3000/product?minPrice=100&maxPrice=300&price=235

```

Devolviendo un array con la siguiente estructura

```typescript
[
  {
    id: 2,
    name: 'BABOLAT AIR VERON 2022',
    price: 235,
    image:
      'https://imgs.search.brave.com/CntldRuuGAWhuSmml4KJkCDa-AVZydzdHVBEBhBayQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMjho/aTkzZ3I2OTdvbC5j/bG91ZGZyb250Lm5l/dC81YTFhNzBlMS02/MzIxLTY5NDQtZWQ5/My02N2E0ODU1MDM1/MDQvaW1nL1Byb2R1/Y3RvL2U2YmUyOTMz/LTVkMGUtZmVkMS1i/OThkLTVlYjgxNDhj/YzBjNy9BQS1WZXJ0/ZXgtMDMtMjAyMy02/NGFlZTBkMTU2MDRm/LmpwZw',
    brand: {
      id: 2,
      name: 'BABOLAT',
    },
  },
];
```

## REFRESH TOKENS

La idea de los refresh tokens se basa en que de ahora en más se manejarán dos tipos de credenciales jwt, en primer lugar el access token normal que te permite hacer las consultas con credenciales y en segundo lugar el refresh token.
La diferencia entre los dos es la de que uno durará una hora máximo y el otro duraría 1 semana (ambos en produccion), la idea de esto es permitir: 

- Seguridad al no tener una unica sesión iniciada constantemente
- Experiencia de usuario al no tener que obligarle al mismo iniciar sesion constantemente

Entonces el funcionamiento sería el siguiente, el usuario de loggea en el sistema de manera normal y en la sección de cookies encontrará 2 credenciales con el nombre de user (access_token) y refresh (refresh_token). El usuario al momento de hacer peticiones que requieran autorización usará el access_token de la cookie de user, que tiene un tiempo máximo de una hora de vida util (en producción).

Para conocer el estado de la sesión actual tenemos el siguiente metodo

```typescript

// Hacemos la peticion al punto /auth/status de la API

fetch('http://localhost:3000/auth/status', {
            credentials: 'include', // Nos aseguramos que el navegador envíe las cookies en la request
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

```

En donde podemos recibir una respuesta con el siguiente formato

```typescript

export class SessionStateDto{
    isLogged: boolean; // Verifica si la sesion está apta para realizar peticiones autenticadas
    refreshTokenExists: boolean; // Verifica la existencia de un token de refresco para crear más tokens de acceso
    message: string; // Un mensaje describiendo la respuesta de la petición
    payload?: any; // En caso de estar loggeado exitosamente retornará el payload del jwt, caso contrario será nulo
}

```

Naturalmente las cookies tienen un tiempo de vida limitado y los jwt una vida útil por lo que hacemos es delimitar un tiempo de existencia para ambas credenciales. Los access_token tendrán un tiempo de uso relativamente corto por cuestiones de seguridad y de no tener un mismo jwt para realizar las peticiones, cuando este expira su tiempo de uso usaremos el refresh para hacer una petición a la API para poder tener otro token de acceso.

Para poder refrescar un token hacemos una POST de la siguiente manera

```typescript

// lo haremos al punto /auth/refresh de la API

fetch('http://localhost:3000/auth/refresh', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

```

pudiendo tener una respuesta sencilla como la siguiente

```typescript
{
    "message": "Logout successful"
}

```
Acá se guardarán todas las cookies en el navegador, por lo que en cliente no habría que guardarlas manualmente como cabecera en las request. Este proceso lo podremos hacer todas las veces que nuestro refreshToken nos permita hacer mientras no expire, en el momento de que este ultimo se vence el mismo guard nos notificará con lo siguiente

```typescript

// Cabe destacar que el guard es una capa que se ejecuta al momento de llegar una request en la api que decide si la misma va a ser ejecutada por el controlador o no

// Guard 

{ error: 'session expired' }

```

Tambien podríamos tener una respuesta similar consultando por el estado de la sesión con el formato dado anteriormente. Pero tambien se nos notificará cuando el usuario consuma algun recurso que requiera autenticación con una sesión expirada. Si llegara a darse el caso que el que expiró fue el access token y hago una peticion que requiera de ese tipo de permisos el guard respondera de la siguiente manera

```typescript

//Guard

{ error: 'token expired, refresh the token again' }

```
También podría darse el caso de que en un momento dado el usuario podría querer terminar la sesión en un momento dado. Para eso se debe controlar la peticion de la siguiente manera

```typescript

// Hace el post a /auth/logout

fetch('http://localhost:3000/auth/logout', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

```

En donde la API se encargará de limpiar todas los tokens del navegador del usuario, respondiendo de la siguiente manera

```typescript

{ message: 'Logout successful' }

```

## ACTUALIZACIÓN DE ENTIDAD DE PRODUCTOS

Los productos de ahora en más se verán de la siguiente manera

```typescript

class Product{

  id: number;

  name: string;

  price: number;

  description: string; // descripcion basica del producto

  image: string; // Imagen principal (la que iría de perfil)

  secondariesImages: ProductImage[]; // Imagenes que acompañan al hacer click, ideal para carrosueles

  type: ProductType; // Tipo de producto

  brand: Brand;

  supplier: Supplier;
}

```

Algunas de las nuevas cosas que se van a poder hacer principalmente son

- Operaciones basicas (getAll, getOne, update, delete) para tipos y las imagenes secundarias

Las imagenes secundarias se manejan individualmente, si se requiere desde el front se manejará una forma para manejar las url de manera más dinamica como la creación de un conjunto de imagenes u operaciones relacionadas

## CAMBIO DE CONTRASEÑA CON ENVIO DE CORREOS

El cambio de contraseña combina 3 endpoints puntuales

- POST /reset-pass-code (requiere el correo al que se enviará el codigo, este mismo debe ser el que está vinculado a la cuenta)
- POST /reset-pass-validate-code (requiere el correo de la cuenta junto con el codigo enviado por mail)
- PATCH /reset-pass (requiere unicamente la nueva contraseña)

Las primeras dos rutas son públicas ya que cualquier usuario podría pedir el cambio de credenciales, pero la última requerirá de un token especial que tendrá cifrada la id del usuario en cuestión. Para conseguir este token basta con pedir el código de verificación (ruta 1) y escribirlo correctamente en la ventana requerida (ruta 2).
Una vez realizado el cambio de contraseña se eliminará el token al igual que el codigo temporal junto con su tiempo de vida. Cabe destacar que el jwt es temporal y solo podrá ser usado durante un tiempo limitado desde su creación (Creemos conveniente que no sean mas de 5 minutos para el token y 15 minutos para el codigo por correo), además de que el código en caso de no ingresarse correctamente no se borrará de la DB, sino que será sobrescrito cuando se vuelva a pedir nuevamente el código. 

IMP: El codigo temporal tiene las siguientes características:

- Es un número al azar de 6 caracteres
- NO está cifrado en la base de datos (podría cambiarse)
- Su tiempo de vida está delimitado por la columna de tiempo de vida, una vez vencido quedará ahí pero será inútil

Las contraseñas siempre deberán tener como mínimo 8 caracteres

## OPENPAY 

Una vez concluido con la elección de los productos por parte del usuario se llevará a cabo el servicio de pagos. El backend ofrecerá dos endpoints, uno para conseguir el access token requerido para llevar a cabo el pago en sí y el otro para conseguir el link del formulario embebido de openpay que se usará para llevar a cabo la transacción. 

El flujo de información constara de primero recuperar el access token en el primer endpoint
```bash
GET
{base}/payment/token
```
Cabe destacar que el token está encriptado con jwt, se guarda en las cookies y tiene un tiempo de vida de 10 minutos. Una vez conseguida esta credencial se llevará a cabo una solicitud POST al segundo endpoint que espera los elementos seleccionados en el carro de compras. La operación se llevaría a cabo de la siguiente manera
```bash
POST
{base}/payment/preference
```
En donde hay que tener en cuenta el siguiente formato en el body
```typescript
{
	data: {
		attributes: {
			currency: "032",
			items: [
				{
					id: 1,
					name: "Chicken roll",
					unitPrice: {
						currency: "032",
						amount: 100 // El amount representa la cantidad en CENTAVOS (100 === 1 peso)
					},
					quantity: 1
				},
				{
					id: 3,
					name: "Porto cheese burger",
					unitPrice: {
						currency: "032",
						amount: 100
					},
					quantity: 2
				}
			]
		}
	}
}
```
Como respuesta se dará una url al formulario embebido, al que se debe redirigir desde el cliente. 

## ORDERS (simplificado)

La order requiere de estos parametros

```typescript
export class CreateOrderDto {
  userId: number; // Id del usuario
  addressId: number; // Id de la direccion relacionada al producto (debe de estar relacionada al usuario)
  paymentId: number; // Id del pago de MP, que viene como parametro en la query de respueta una vez pagado
  products: ProductQuantity[];
  installments?: number; // Cuotas (1 por defecto)
  paymentMethod: MethodPaymentType; // Metodo de pago ("MP_TRANSFER" por defecto)
}

//Estructura para los productos
export class ProductQuantity {
  productId: number; // Id del producto
  quantity: number; // Cantidad solicitada
}
```

Esta llamada debe de hacerse una vez hecho el pago