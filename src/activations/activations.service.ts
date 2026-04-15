import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromoCode } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivationDto } from './dto/create-activation.dto';

@Injectable()
export class ActivationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<PromoCode[]>`
          SELECT *
          FROM "PromoCode"
          WHERE "code" = ${dto.code}
          FOR UPDATE
        `;

        const promoCode = rows[0];

        if (!promoCode) {
          throw new NotFoundException('Promo code not found');
        }

        if (promoCode.expiresAt <= new Date()) {
          throw new ConflictException('Promo code is expired');
        }

        if (promoCode.activationCount >= promoCode.activationLimit) {
          throw new ConflictException('Promo code activation limit reached');
        }

        const existingActivation = await tx.activation.findUnique({
          where: {
            promoCodeId_email: {
              promoCodeId: promoCode.id,
              email: dto.email,
            },
          },
        });

        if (existingActivation) {
          throw new ConflictException(
            'This email has already activated the promo code',
          );
        }

        const activation = await tx.activation.create({
          data: {
            promoCodeId: promoCode.id,
            email: dto.email,
          },
        });

        await tx.promoCode.update({
          where: { id: promoCode.id },
          data: {
            activationCount: {
              increment: 1,
            },
          },
        });

        return activation;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This email has already activated the promo code',
        );
      }

      throw error;
    }
  }
}
