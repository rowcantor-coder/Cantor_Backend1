
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DoctorService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService
      .getPool()
      .query('SELECT * FROM doctor');

    return rows;
  }

  async findOne(id: number) {
    const [rows]: any = await this.databaseService
      .getPool()
      .query('SELECT * FROM doctor WHERE doctor_id = ?', [id]);

    if (rows.length === 0) {
      throw new NotFoundException('Doctor not found');
    }

    return rows[0];
  }

  async create(data: {
    doctor_name: string;
    specialization: string;
    department_id: number;
  }) {
    const [result]: any = await this.databaseService
      .getPool()
      .query(
        'INSERT INTO doctor (doctor_name, specialization, department_id) VALUES (?, ?, ?)',
        [data.doctor_name, data.specialization, data.department_id],
      );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    data: {
      doctor_name: string;
      specialization: string;
      department_id: number;
    },
  ) {
    await this.findOne(id);

    await this.databaseService.getPool().query(
      'UPDATE doctor SET doctor_name = ?, specialization = ?, department_id = ? WHERE doctor_id = ?',
      [
        data.doctor_name,
        data.specialization,
        data.department_id,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.databaseService
      .getPool()
      .query('DELETE FROM doctor WHERE doctor_id = ?', [id]);

    return { message: 'Doctor deleted successfully' };
  }
}
