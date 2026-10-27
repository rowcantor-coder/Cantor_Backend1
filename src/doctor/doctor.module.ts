
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DoctorController],
  providers: [
    {
      provide: 'DoctorService',
      useClass: DoctorService,
    },
    DoctorService,
  ],
  exports: [DoctorService],
})
export class DoctorModule {}
