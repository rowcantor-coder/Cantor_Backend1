
import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DatabaseService)
    private readonly db: DatabaseService,
  ) {}

  private pool = () => this.db.getPool();

  async createUser(username: string, password: string, role = 'user') {
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashed, role],
    );

    return { id: result.insertId, username, role };
  }

  async findByUsername(username: string) {
    // Temporary diagnostics: check the database and table columns.
    const [dbRows] = await this.pool().query<RowDataPacket[]>(
      'SELECT DATABASE() AS dbName',
    );

    const [columns] = await this.pool().query<RowDataPacket[]>(
      'SHOW COLUMNS FROM users',
    );

    console.log('Login diagnostic database:', dbRows[0]?.dbName);
    console.log(
      'Login diagnostic columns:',
      columns.map((column) => column.Field),
    );

    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, password, role, refresh_token
       FROM users
       WHERE username = ?`,
      [username],
    );

    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, role, created_at
       FROM users
       WHERE user_id = ?`,
      [id],
    );

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, role, created_at
       FROM users`,
    );

    return rows;
  }

  async updateUser(
    id: number,
    partial: { username?: string; password?: string; role?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await this.pool().execute(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE user_id = ?`,
      values,
    );

    return this.findById(id);
  }

  async deleteUser(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE user_id = ?',
      [id],
    );

    return result.affectedRows > 0;
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE users SET refresh_token = ? WHERE user_id = ?',
      [refreshToken, id],
    );
  }

  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, role
       FROM users
       WHERE refresh_token = ?`,
      [refreshToken],
    );

    return rows[0];
  }
}
