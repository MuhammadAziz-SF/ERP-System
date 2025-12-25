import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerType } from '../../core/entities/partner.entity';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({
    status: 201,
    description: 'The partner has been successfully created.',
  })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all partners' })
  @ApiQuery({ name: 'type', enum: PartnerType, required: false })
  findAll(@Query('type') type?: PartnerType) {
    if (type) {
      return this.partnersService.findByType(type);
    }
    return this.partnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a partner by ID' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a partner' })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) a partner' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
