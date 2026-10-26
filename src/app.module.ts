
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { DepartmentModule } from './department/department.module';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    DepartmentModule,
    DoctorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
