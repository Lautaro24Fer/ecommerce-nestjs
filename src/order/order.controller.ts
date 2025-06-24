import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  BadRequestException,
  Query,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IBadRequestex, IRecourseCreated, IRecourseDeleted, IRecourseFound, IUnauthorizedEx } from '../global/responseInterfaces';
import { Order } from './entities/order.entity';
import { OrderDto } from './dto/order.dto';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { QueryParamsDto } from './dto/query-params.dto';
import { AuthGuard, ITokenPayload } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';


@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService) {}

  @ApiOperation({
    summary: "Create a new order"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The order was created succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Not authorized to create orders"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error in the creation of the order"
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<IRecourseCreated<OrderDto>> {
    const response: IRecourseCreated<Order> = await this.orderService.create(createOrderDto);
    const orderDto: OrderDto = this.orderService.mapOrderToOrderDto(response.recourse);

    // Envío de la orden por correo al admin

    await this.emailService.sendEmailForOrder(response.recourse).catch((error) => {
      console.error("Error tryng to send order email");
      console.error(error);
    });

    const recourse: IRecourseCreated<OrderDto> = {
      ...response,
      recourse: orderDto
    };
    return recourse;
  }

  @ApiOperation({
    summary: "Find all orders"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The orders was found succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Not authorized to load orders"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error finding the ordersr"
  })
  @ApiQuery({
    name: 'minDate',
    required: false,
    type: String,
    description: 'Min date for filter the orders',
  })
  @ApiQuery({
    name: 'maxDate',
    required: false,
    type: String,
    description: 'Max date for filter the orders',
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Get()
  async findAll(@Query() queryParams: QueryParamsDto): Promise<IRecourseFound<OrderDto[]>> {
    const orders: IRecourseFound<Order[]> = await this.orderService.findAll(queryParams);
    const ordersDto: OrderDto[] = orders.recourse.map((order) => {
      const orderDto: OrderDto = this.orderService.mapOrderToOrderDto(order);
      return  orderDto
    });
    const response: IRecourseFound<OrderDto[]> = {
      status: true,
      message: "The orders was found succesfully",
      recourse: ordersDto
    };
    return response;
  }

  @ApiOperation({
    summary: 'Get all the orders of one user by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The orders were found successfully',
    type: OrderDto,
    isArray: true
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request, error loading the user orders'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request to load user orders'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user with the specified id was not found'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get('user/:id')
  async getUserOrders(@Param('id') id: number, @Req() req: Request): Promise<IRecourseFound<OrderDto[]>>{

    const userToken: string = req?.cookies['user'];
    // Esta interfaz deberia estar en global
    const userPayload: ITokenPayload = await this.jwtService.decode(userToken);
    const isUser = userPayload.roles.findIndex((m) => m.name === 'user') >= 0;
    if ((isUser) && (userPayload?.id != id)) {
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: `User ID '${id}' does not match the token ID`
      }
      throw new UnauthorizedException(unauthError);
    }

    const orders: IRecourseFound<Order[]> = await this.orderService.findOrdersByUserId(id);
    const ordersDto: OrderDto[] = orders.recourse.map((order) => {
      return this.orderService.mapOrderToOrderDto(order);
    });
    const response: IRecourseFound<OrderDto[]> = {
      ...orders,
      recourse: ordersDto
    };
    return response;
  }

  @ApiOperation({
    summary: "Find one order by id"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The order was found succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Not authorized to load orders"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Order not found by id"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error finding the order"
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IRecourseFound<OrderDto>> {
    const recourseFound: IRecourseFound<Order> = await this.orderService.findOneById(id);
    try{
      const orderDto: OrderDto = this.orderService.mapOrderToOrderDto(recourseFound.recourse);
      const response: IRecourseFound<OrderDto> = {
        ...recourseFound,
        recourse: orderDto
      }
      
      return response;
    }
    catch(error){
      console.error(error)
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error in controller instance. Can not load order with id: '${id}'`
      };
      throw new BadRequestException(badRequestError);
    }
  }

  // @Patch(':id')
  // update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  @ApiOperation({
    summary: "Delete one order by id"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The order was deleted succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Not authorized to delete orders"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Order not found by id"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error deleting the order"
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<IRecourseDeleted<OrderDto>> {
    const recourseDeleted: IRecourseDeleted<Order> = await this.orderService.remove(id);
    const orderParsed: OrderDto = this.orderService.mapOrderToOrderDto(recourseDeleted.recourse);
    const response: IRecourseDeleted<OrderDto> = {
      ...recourseDeleted,
      recourse: orderParsed
    };
    return response;
  }
}
