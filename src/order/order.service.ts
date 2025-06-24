import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, ProductOrder } from './entities/order.entity';
import { Repository } from 'typeorm';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../user/dto/user.dto';
import { OrderDto } from './dto/order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductOrderDto } from './dto/product-order.dto';
import { EmailService } from '../email/email.service';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class OrderService {

  constructor( 
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>, 
    @InjectRepository(ProductOrder) private readonly productOrderRepository: Repository<ProductOrder>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService) {}

    ACCESS_TOKEN = this.configService.get<string>('MP_ACCESS_TOKEN');

  async verifyStatus(paymentId: number){
    if(paymentId === 12345 ){ // Codigo de prueba
      return true;
    }

    const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      },
    })
    .then(data => data.json())
    .catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error fetching the payment status by payment id"
      };
      throw new BadRequestException(badRequestError);
    });
    if(response?.status === 404) {
      const badRequestError: INotFoundEx = {
        status: false,
        message: `The payment order with id '${paymentId}' was not found in mercado pago server`
      }
      throw new NotFoundException(badRequestError);
    }
    return response;
  }

  async create(createOrderDto: CreateOrderDto): Promise<IRecourseCreated<Order>> {

    // Verificar si el paymentId existe en el servidor de mercado pago
    const mpApiResponse = await this.verifyStatus(createOrderDto?.paymentId);

    const user: User = (await this.userService.findOneById(createOrderDto?.userId))?.recourse;

    const address: Address = user?.address.find((add) => add.id === createOrderDto.addressId);

    if((createOrderDto.addressId) && (!address)) {
      const badRequestError: INotFoundEx = {
        status: false,
        message: `The address with id '${createOrderDto?.addressId}' was not register with the user or not exists`
      };
      throw new NotFoundException(badRequestError);
    };

    const paymentIdExists: boolean = await this.orderRepository.existsBy({ paymentId:createOrderDto?.paymentId?.toString() });

    if(paymentIdExists) {
      const badRequestError: IBadRequestex = {
        status: false,
        message: `The payment id '${createOrderDto?.paymentId}' already exists`
      };
      throw new BadRequestException(badRequestError);
    }

    const orderInstance = this.orderRepository.create({
      ...createOrderDto,
      address,
      user,
      paymentId: createOrderDto?.paymentId.toString(),
      productOrder: [],
    });


    let netPrice: number = 0;
    let cost: number = 0;

    await Promise.all(createOrderDto?.products.map(async (productInstance) => {
      const product: Product = (await this.productService.findOne(productInstance.productId))?.recourse;
      if(!product.isActive){
        const badRequestError: IBadRequestex = {
          status: false,
          message: `The product with id '${product.id}' is not active (deleted)`
        };
        throw new BadRequestException(badRequestError);
      }
      if(product?.stock < productInstance.quantity){
        const badRequestError: IBadRequestex = {
          status: false,
          message: `The product with id '${product.id}' not have many stock`
        };
        throw new BadRequestException(badRequestError);
      }
      netPrice = netPrice + Number(product.price) * productInstance.quantity;
      cost =  cost + Number(product.cost) * productInstance.quantity;
    }));

    // Pricing data
    if(!createOrderDto?.IVA){
      orderInstance.IVA = 0.21;
    }

    console.log("el valor neto final tiene un valor de: $" + netPrice + " | costo: $" + cost);
    console.log("La ganancia final en este caso es de: $" + (netPrice - cost));

    orderInstance.netPrice = netPrice;
    orderInstance.profit = netPrice - cost; // Del precio neto total de la orden se resta el costo total de todos los productos
    let IVARealValue: number = netPrice * orderInstance.IVA;
    orderInstance.total = netPrice + IVARealValue;


    const orderCreated: Order = await this.orderRepository.save(orderInstance).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of a new order"
      };
      throw new BadRequestException(badRequestError);
    });

    const products: ProductOrder[] = await Promise.all(createOrderDto?.products.map(async (productInstance) => {
      const productFound: Product = (await this.productService.findOne(productInstance.productId))?.recourse;

      // TODO: ESTO DEBE HACERSE AL FINAL UNA VEZ NO HAYA EXCEPCIONES AL CREAR LA ORDEN
      productFound.stock = productFound.stock - productInstance.quantity;
      

      const productUpdated: Product = (await this.productService.update(productFound.id, { stock: productFound.stock }))?.recourse;

      const productOrder: ProductOrder = this.productOrderRepository.create({
        product: productUpdated,
        quantity: productInstance.quantity,
        order: orderCreated,
      });
      const productOrderCreated: ProductOrder = await this.productOrderRepository.save(productOrder).catch((error) => {
        console.error(error);
        const badRequestError: IBadRequestex = {
          status: false,
          message: `Error in the creation of the productOrder in the order service`
        };
        throw new BadRequestException(badRequestError);
      })

      return productOrderCreated;
    }));

    orderCreated.productOrder = [...products]; 
    

    const orderUpdated: Order = await this.orderRepository.save(orderCreated).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error adding the products in the order"
      };
      throw new BadRequestException(badRequestError);
    });

    const recourse: IRecourseCreated<Order> = {
      status: true,
      message: "The order was created succesfully",
      recourse: orderUpdated
    };

  
    return recourse;
  }

  async update(updateOrderDto: UpdateOrderDto): Promise<IRecourseUpdated<OrderDto>> {
    // Actualizacion de fechas de entrega estimadas, finales, y fechas de pago

    return
  }

  async findAll(queryParams: QueryParamsDto): Promise<IRecourseFound<Order[]>> {
    let orders: Order[];
  
    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoin('order.user', 'user') // Cambia a leftJoin
      .leftJoinAndSelect('order.address', 'address') // Join with address
      .leftJoinAndSelect('order.productOrder', 'productOrder')
      .leftJoinAndSelect('productOrder.product', 'product')
      .select(['order', 'user.id', 'address', 'productOrder', 'product']);
  
      if (queryParams.minDate) {
        queryBuilder.andWhere('order.dateCreated >= :minDate', { minDate: queryParams.minDate });
      }
  
      if (queryParams.maxDate) {
        queryBuilder.andWhere('order.dateCreated <= :maxDate', { maxDate: queryParams.maxDate });
      }
  
      orders = await queryBuilder.getMany();
    } 
    catch (error) {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error loading all the orders from the database"
      };
      throw new BadRequestException(badRequestError);
    }
  
    const response: IRecourseFound<Order[]> = {
      status: true,
      message: "The orders were found successfully",
      recourse: orders
    };
    return response;
  }
  async findProductOrderById(id: number) {
    const productOrder: ProductOrder = await this.productOrderRepository.findOne({ where: { id }, relations: ['product'] }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error finding the productOrder with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    if(!productOrder){
      const badRequestError: INotFoundEx = {
        status: false,
        message: `Order product with id '${id}' was not found`
      };
      throw new NotFoundException(badRequestError);
    }
    return productOrder;
  }

  async findOrdersByUserId(id: number): Promise<IRecourseFound<Order[]>>{

    await this.userService.findOneById(id);
    
    try{
      const orders: Order[] = await this.orderRepository.createQueryBuilder('order')
      .leftJoin('order.user', 'user') // Cambia a leftJoin
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.productOrder', 'productOrder')
      .leftJoinAndSelect('productOrder.product', 'product')
      .where('user.id = :userId', { userId: id })
      .select(['order', 'user.id', 'address', 'productOrder', 'product']) // Selecciona explícitamente los campos
      .getMany();
      const recourse: IRecourseFound<Order[]> = {
        status: true,
        message: "The orders was found succesfully",
        recourse: orders
      };
  
      console.log("FIND ORDERSS BY USER ID")
      console.log(orders)

      return recourse;
    }
    catch(error) {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error loading the orders by user id: ${id}`
      };
      throw new BadRequestException(badRequestError);
    };
  }

  async findOneById(id: number): Promise<IRecourseFound<Order>> {
    
    const order: Order = await this.orderRepository.findOne({ where: { id }, relations: { productOrder: true, user: true, address: true}})
    .catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error finding the order by id"
      };
      throw new BadRequestException(badRequestError);
    });
    if(!order){
      const notFoundError: INotFoundEx = {
        status: false,
        message: `The order with id '${id}' was not found`
      };
      throw new NotFoundException(notFoundError);
    }

    const user: User = (await this.userService.findOneById(order.user.id))?.recourse;
    order.user = user;

    const productOrders: ProductOrder[] = await Promise.all(order.productOrder.map(async (po) => {
      const productOrder: ProductOrder = await this.findProductOrderById(po.id);
      return productOrder;
    }));

    order.productOrder = [...productOrders];

    const response: IRecourseFound<Order> = {
      status: true,
      message: "The order was found succesfully",
      recourse: order
    };
    return response;
  }

  async remove(id: number): Promise<IRecourseDeleted<Order>> {
    
    const order: Order = (await this.findOneById(id))?.recourse;
    await this.orderRepository.delete(order.id).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the order with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourseDeleted: IRecourseDeleted<Order> = {
      status: true,
      message: `The recourse was deleted succesfully`,
      recourse: order
    };
    return recourseDeleted;
  }

  mapOrderToOrderDto(order: Order): OrderDto{

    const userDto: UserDto = this.userService.mapUserToUserDto(order.user);

    const productOrdersDto: ProductOrderDto[] = order.productOrder.map((po) => {

      const productOrderDto: ProductOrderDto = {
        id: po.id,
        orderId: order.id,
        product: po.product,
        quantity: po.quantity
      }
      return productOrderDto;
    })

    const orderDto: OrderDto = {
      user: userDto,
      destination: order.address,
      paymentId: order.paymentId,
      items: productOrdersDto,
      netPrice: order.netPrice,
      IVA: order.IVA,
      total: order.total,
      profit: order.profit
    };

    return orderDto;
  }
}
