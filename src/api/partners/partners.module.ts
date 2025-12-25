import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerSchema } from '../../core/entities/partner.entity';
import { PartnerRepository } from '../../core/repository/partner.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Partner', schema: PartnerSchema }]),
  ],
  controllers: [PartnersController],
  providers: [PartnersService, PartnerRepository],
  exports: [PartnersService, PartnerRepository],
})
export class PartnersModule {}
