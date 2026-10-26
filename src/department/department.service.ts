
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DepartmentService {
  constructor(
  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService,
  ) {}

  async findAll() {
    const [rows] = await this.databaseService
      .getPool()
      .query('SELECT * FROM department');

    return rows;
  }

  async findOne(id: number) {
    const [rows]: any = await this.databaseService
      .getPool()
      .query('SELECT * FROM department WHERE department_id = ?', [id]);

    if (rows.length === 0) {
      throw new NotFoundException('Department not found');
    }

    return rows[0];
  }

  async create(data: { department_name: string; location: string }) {
    const [result]: any = await this.databaseService
      .getPool()
      .query(
        'INSERT INTO department (department_name, location) VALUES (?, ?)',
        [data.department_name, data.location],
      );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    data: { department_name: string; location: string },
  ) {
    await this.findOne(id);

    await this.databaseService.getPool().query(
      'UPDATE department SET department_name = ?, location = ? WHERE department_id = ?',
      [data.department_name, data.location, id],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.databaseService
      .getPool()
      .query('DELETE FROM department WHERE department_id = ?', [id]);

    return { message: 'Department deleted successfully' };
  }
}

