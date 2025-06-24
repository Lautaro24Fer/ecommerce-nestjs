import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<IRecourseCreated<Supplier>> {
    const supplierCreated: Supplier = await this.supplierRepository.save(createSupplierDto).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of the supplier"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseCreated<Supplier> = {
      status: true,
      message: "The supplier was created succesfully",
      recourse: supplierCreated
    }
    return response;
  }

  async findAll(): Promise<IRecourseFound<Supplier[]>> {
    const suppliers: Supplier[] = await this.supplierRepository.find().catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error loading the suppliers"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseFound<Supplier[]> = {
      status: true,
      message: "The suppliers was loaded succesfully",
      recourse: suppliers
    }
    return response;
  }

  async findOne(id: number): Promise<IRecourseFound<Supplier>> {
    const supplier: Supplier = await this.supplierRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error loading the supplier with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    if (!supplier) {
      const badRequestError: INotFoundEx = {
        status: false,
        message: `Supplier with id '${id}' not found`
      };
      throw new NotFoundException(badRequestError);
    }
    const response: IRecourseFound<Supplier> = {
      status: true,
      message: "The suppliers was loaded succesfully",
      recourse: supplier
    }
    return response;
  }

  async update( id: number, updateSupplierDto: UpdateSupplierDto ): Promise<IRecourseUpdated<Supplier>> {
    const supplier: Supplier = (await this.findOne(id)).recourse;
    Object.assign(supplier, updateSupplierDto);
    const supplierUpdated: Supplier = await this.supplierRepository.save(supplier).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error saving the supplier with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseUpdated<Supplier> = {
      status: true,
      message: "The supplier was updated succesfully",
      recourse: supplierUpdated
    };
    return recourse;
  }

  async remove(id: number): Promise<IRecourseDeleted<Supplier>> {
    const supplier: Supplier = (await this.findOne(id)).recourse;
    const removed: Supplier = await this.supplierRepository.remove(supplier).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the supplier with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseDeleted<Supplier> = {
      status: true,
      message: "The supplier was updated succesfully",
      recourse: removed
    };
    return recourse;
  }
}
