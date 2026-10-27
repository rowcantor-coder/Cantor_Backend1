
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class DoctorService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll() {
    const pool = this.databaseService.getPool();

    // Check kung anong database at account ang ginagamit ng Render
    const [diagnostics] = await pool.query<RowDataPacket[]>(`
      SELECT
        DATABASE() AS databaseName,
        CURRENT_USER() AS authenticatedUser,
        (SELECT COUNT(*) FROM doctor) AS totalDoctors
    `);

    console.log('DOCTOR DATABASE DIAGNOSTICS:', diagnostics[0]);

    // Kunin lahat ng doctor records
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM doctor ORDER BY doctor_id',
    );

    console.log('DOCTORS RETURNED:', rows.length);

    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.databaseService
      .getPool()
      .query<RowDataPacket[]>(
        'SELECT * FROM doctor WHERE doctor_id = ?',
        [id],
      );

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
    const [result] = await this.databaseService
      .getPool()
      .query<ResultSetHeader>(
        `INSERT INTO doctor
          (doctor_name, specialization, department_id)
         VALUES (?, ?, ?)`,
        [
          data.doctor_name,
          data.specialization,
          data.department_id,
        ],
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
      `UPDATE doctor
       SET doctor_name = ?, specialization = ?, department_id = ?
       WHERE doctor_id = ?`,
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

    return {
      message: 'Doctor deleted successfully',
    };
  }
}
