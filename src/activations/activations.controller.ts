import { Body, Controller, Post } from '@nestjs/common';
import { CreateActivationDto } from './dto/create-activation.dto';
import { ActivationsService } from './activations.service';

@Controller('activations')
export class ActivationsController {
  constructor(private readonly activationsService: ActivationsService) {}

  @Post()
  create(@Body() dto: CreateActivationDto) {
    return this.activationsService.create(dto);
  }
}
