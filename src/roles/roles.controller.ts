import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { Role } from './entities/role.entity';
import { Roles } from '../auth/auth.decorator';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}


  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error creating the role'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Can not create a role, unauthorized request'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Post()
  create(@Body() createRoleDto: CreateRoleDto): Promise<IRecourseCreated<Role>> {
    return this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All roles loaded succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error roles all products'
  })
  @Get()
  findAll(): Promise<IRecourseFound<Role[]>> {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: 'Get a role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role loaded succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading all roles'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Can not get this role, unauthorized request'
  })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<IRecourseFound<Role>> {
    return this.rolesService.findOne(id);
  }

  // Los siguientes endpoints solamente estarán de manera temporal
  // Debemos hablar si un administrdor puede eliminar o actualizar roles, o que lo pueda hacer solo con 
  // aquellos que no sean ni User o Admin

  @ApiOperation({ summary: 'Update a role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error updating role'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Can not update this role, unauthorized request'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Put(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<IRecourseUpdated<Role>> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete a role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error deleting all roles'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Can not delete this role, unauthorized request'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: number): Promise<IRecourseDeleted<Role>> {
    return this.rolesService.remove(id);
  }
}
