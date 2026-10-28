
import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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

  async createUser(
    username: string,
    password: string,
    role = 'user',
    email = '',
  ) {
    if (!email.trim()) {
      throw new Error('Email is required for registration');
    }

    const [existing] = await this.pool().execute<RowDataPacket[]>(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email],
    );

    if (existing.length > 0) {
      throw new ConflictException(
        'Username or email already exists',
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashed, role],
    );

    return {
      id: result.insertId,
      username,
      email,
      role,
    };
  }

  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, email, password, role, refresh_token
       FROM users
       WHERE username = ?`,
      [username],
    );

    return rows[0] ?? null;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, email, role, created_at
       FROM users
       WHERE user_id = ?`,
      [id],
    );

    if (!rows[0]) {
      throw new NotFoundException('User not found');
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT user_id AS id, username, email, role, created_at
       FROM users`,
    );

    return rows;
  }

  async updateUser(
    id: number,
    partial: {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username.trim());
    }

    if (partial.email) {
      fields.push('email = ?');
      values.push(partial.email.trim());
    }

    if (partial.password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(partial.password, 10));
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const [result] = await this.pool().execute<OkPacket>(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return this.findById(id);
    }

    return this.findById(id);
  }

  async deleteUser(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE user_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async setRefreshToken(
    id: number,
    refreshToken: string | null,
  ) {
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

    return rows[0] ?? null;
  }
}
