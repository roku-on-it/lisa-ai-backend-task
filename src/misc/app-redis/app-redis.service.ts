import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

import * as msgpack from '@msgpack/msgpack';

@Injectable()
export class AppRedisService implements OnModuleInit {
  private client: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      port: this.config.getOrThrow('KV_STORE_PORT'),
      host: this.config.getOrThrow('KV_STORE_HOST'),
    });
  }

  async set(key: string, value: string) {
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async setObj<T>(key: string, obj: T) {
    const data = msgpack.encode(obj);

    return this.client.set(key, Buffer.from(data).toString('binary'));
  }

  async getObj<T>(key: string): Promise<T> {
    const data = await this.client.get(key);

    return msgpack.decode(Buffer.from(data, 'binary')) as T;
  }
}
