import { Module } from '@nestjs/common';
import { ActivationsModule } from './activations/activations.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';

@Module({
  imports: [PrismaModule, PromoCodesModule, ActivationsModule],
})
export class AppModule {}
