import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IBadRequestex, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { Address } from './entities/address.entity';
import { Roles } from '../auth/auth.decorator';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({
    summary: 'Create a new address'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Address created succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to create a new address'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the creation of the new address'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Post()
  async create(@Body() createAddressDto: CreateAddressDto): Promise<IRecourseCreated<Address>> {
    const { postalCode, addressNumber, addressStreet } = createAddressDto;
    const addressExists: boolean = await this.addressService.findOneByAllData(postalCode, addressStreet, addressNumber)
    .then(_ => true)
    .catch(async (error) => {
      if(error instanceof NotFoundException){
        return false
      }
      throw new BadRequestException(error);
    });
    if(addressExists){
      const badRequestError: IBadRequestex = {
        status: false,
        message: `The address with postal code '${postalCode}', address street '${addressStreet}' and address number '${addressNumber}' already exists`
      };
      throw new BadRequestException(badRequestError);
    }
    const addressCreated: IRecourseCreated<Address> = await this.addressService.create(createAddressDto);
    return addressCreated;
  }

  @ApiOperation({
    summary: 'Find all addreses'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address loaded succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to get addresses'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The addresses was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the addresses'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get()
  findAll(): Promise<IRecourseFound<Address[]>> {
    return this.addressService.findAll();
  }

  @ApiOperation({
    summary: 'Get one address by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address loaded succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to get the address'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The address was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the address'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get(':id')
  findOne(@Param('id') id: number): Promise<IRecourseFound<Address>> {
    return this.addressService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update one address by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to update the address'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The address was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error updating the address'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateAddressDto: UpdateAddressDto): Promise<IRecourseUpdated<Address>> {
    return this.addressService.update(id, updateAddressDto);
  }

  @ApiOperation({
    summary: 'Remove one address by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Address deleted succesfully'  
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to delete the address'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The address was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error removing the address'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: number): Promise<IRecourseDeleted<Address>> {
    return this.addressService.remove(id);
  }
}
