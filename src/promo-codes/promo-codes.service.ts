import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromoCodeDto) {
    this.validateExpiresAt(dto.expiresAt);

    try {
      return await this.prisma.promoCode.create({
        data: {
          code: dto.code,
          discountPercent: dto.discountPercent,
          activationLimit: dto.activationLimit,
          expiresAt: new Date(dto.expiresAt),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.promoCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  async update(id: string, dto: UpdatePromoCodeDto) {
    if (dto.expiresAt) {
      this.validateExpiresAt(dto.expiresAt);
    }

    const existing = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Promo code not found');
    }

    if (
      dto.activationLimit !== undefined &&
      dto.activationLimit < existing.activationCount
    ) {
      throw new BadRequestException(
        'Activation limit cannot be less than activation count',
      );
    }

    try {
      return await this.prisma.promoCode.update({
        where: { id },
        data: {
          code: dto.code,
          discountPercent: dto.discountPercent,
          activationLimit: dto.activationLimit,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.promoCode.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Promo code not found');
      }

      throw error;
    }
  }

  private validateExpiresAt(expiresAt: string) {
    const date = new Date(expiresAt);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid expiration date');
    }

    if (date <= new Date()) {
      throw new BadRequestException('Expiration date must be in the future');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Promo code with this code already exists');
    }

    throw error;
  }
}
