
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  pool!: mysql.Pool;

  async onModuleInit() {
    const caPath = path.resolve(process.cwd(), 'certs', 'ca.pem');
    const caCertificate = fs.readFileSync(caPath, 'utf8');

    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      ssl: {
        ca: caCertificate,
        rejectUnauthorized: true,
      },

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 20000,
    });

    const connection = await this.pool.getConnection();

    try {
      await connection.ping();
      console.log('MySQL pool created and connection verified');
    } finally {
      connection.release();
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool() {
    return this.pool;
  }
}
