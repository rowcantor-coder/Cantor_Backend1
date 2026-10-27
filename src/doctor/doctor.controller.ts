
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';

@Controller('doctors')
export class DoctorController {
  constructor(
  private readonly doctorService: DoctorService,
) {}

  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      doctor_name: string;
      specialization: string;
      department_id: number;
    },
  ) {
    return this.doctorService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      doctor_name: string;
      specialization: string;
      department_id: number;
    },
  ) {
    return this.doctorService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.remove(id);
  }
}
