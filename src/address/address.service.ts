import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../user/user.service';
import { UpdateType } from '../global/enum';

@Injectable()
export class AddressService {

  constructor(
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService
  ) {}


  // Ejecuta la limpieza cada día a medianoche
  @Cron('0 0 * * *')

  // cada dos min
  // @Cron('*/2 * * * *') 

  // async handleCron() {
  //   await this.removeOrphanedAddresses();
  // }

  async removeOrphanedAddresses(): Promise<void> {
    const orphanedAddresses = await this.addressRepository
      .createQueryBuilder('address')
      .leftJoin('address.user', 'user')
      .where('user.id IS NULL')
      .getMany();

    if (orphanedAddresses.length > 0) {
      await this.addressRepository.remove(orphanedAddresses);
    }
  }

  async findOrCreate(createAddressDto: CreateAddressDto): Promise<IRecourseCreated<Address>>{
    const { postalCode, addressNumber, addressStreet } = createAddressDto;
    let estado = ""
    const address: Address = await this.findOneByAllData(postalCode, addressStreet, addressNumber)
    .then(data => {
      estado = "ENCONTRADO EN LA BASE DE DATOS"
      return data.recourse
    })
    .catch(async (error) => {
      if(error instanceof NotFoundException){
        const newAddress: IRecourseCreated<Address> = await this.create({ postalCode, addressNumber, addressStreet });
        estado = "NO ENCONTRADO EN LA BASE DE DATOS ASI QUE FUE CREADO"
        return newAddress.recourse;
      }
    });
    const recourse: IRecourseCreated<Address> = {
      status: true,
      message: "The address was created succesfully",
      recourse: address
    };
    return recourse;
  }

  async create(createAddressDto: CreateAddressDto): Promise<IRecourseCreated<Address>> {

    let body: Address;

    try {
      body = this.addressRepository.create({
        postalCode: createAddressDto.postalCode.toUpperCase(),
        addressNumber: createAddressDto.addressNumber.toLowerCase(),
        addressStreet: createAddressDto.addressStreet.toLowerCase()
      });
    } catch (error) {
      console.error(error)
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error creating the new instance of address"
      };
      throw new BadRequestException(badRequestError);
    }

    const addressCreated: Address = await this.addressRepository.save(body).catch((error) => {
      console.error(error);
      const response: IBadRequestex = { status: false, message: 'Error creating the new address' };
      throw new BadRequestException(response);
    });

    if(createAddressDto.userId) {
      await this.userService.update(createAddressDto.userId, {
        address: [addressCreated],
      }, UpdateType.PARTIAL)
    }

    const response: IRecourseCreated<Address> = {
      status: true,
      message: "The address was created succesfully",
      recourse: addressCreated
    };

    return response;
  }

  async findAll(): Promise<IRecourseCreated<Address[]>> {
    const addresses: Address[] = await this.addressRepository.find().catch((error) => {
      console.error(error);
      const response: IBadRequestex = { status: false, message: 'Error loading the addresses saved' };
      throw new BadRequestException(response);
    })
    const recourse: IRecourseCreated<Address[]> = {
      status: true,
      message: "The addresses was loaded succesfully",
      recourse: addresses
    };
    return recourse;
  }

  async findOne(id: number): Promise<IRecourseFound<Address>> {
    const address: Address = await this.addressRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const response: IBadRequestex = { status: false, message: 'Error loading the addresses saved' };
      throw new BadRequestException(response);
    })
    if(!address){
      const response: INotFoundEx = { status: false, message: `The address with id '${id}' was not found` }
      throw new NotFoundException(response);
    }
    const recourse: IRecourseFound<Address> = {
      status: true,
      message: `The address with id ${id} was found succesfully`,
      recourse: address
    };
    return recourse;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<IRecourseUpdated<Address>> {

    const addressToUpdate: Address = (await this.findOne(id)).recourse;
    const updatedBody = { ...addressToUpdate, ...updateAddressDto };
    const addressUpdated: Address = await this.addressRepository.save(updatedBody).catch((error) => {
      console.error(error);
      const response: IBadRequestex = { 
        status: false, 
        message: 'Error saving the new state of the address' 
      };
      throw new BadRequestException(response);
    })

    const response: IRecourseUpdated<Address> = {
      status: true,
      message: `The address with id '${id}' was updated succesfully`,
      recourse: addressUpdated
    }
    return response;
  }

  async remove(id: number): Promise<IRecourseDeleted<Address>> {
    const address: Address = (await this.findOne(id)).recourse;
    await this.addressRepository.remove(address).catch((error) => {
      console.error(error);
      const response: IBadRequestex = {
        status: false,
        message: `Error removing the address with id '${id}'`
      };
      throw new BadRequestException(response);
    });
    const response: IRecourseDeleted<Address> = { 
      status: true, message: `The address with id '${id}' was deleted succesfully`, 
      recourse: address 
    };
    return response;
  }

  // Teniendo en cuenta que hay muchas variantes de direcciones, se busca 
  // que una dirección exacta exista previamente en la base de datos
  async findOneByAllData(postalCode: string, addressStreet: string, addressNumber: string): Promise<IRecourseFound<Address>>{

    const address: Address = await this.addressRepository.findOneBy({
      postalCode: postalCode.toUpperCase(),
      addressStreet: addressStreet.toLowerCase(),
      addressNumber: addressNumber.toLowerCase()
    }).catch((error) => {
      console.error(error);
      const response: IBadRequestex = { status: false, message: 'Error finding the address by all data of the entity' };
      throw new BadRequestException(response);
    });

    if(!address){
      const response: INotFoundEx = { 
        status: false, 
        message: `The address with postal code '${postalCode}', addressStreet '${addressStreet}' and addressNumber ${addressNumber} was not found` 
      };
      throw new NotFoundException(response);
    };

    const recourse: IRecourseFound<Address> = {
      status: true,
      message: 'The recourse was found succesfully',
      recourse: address
    };

    return recourse;
  }
}
