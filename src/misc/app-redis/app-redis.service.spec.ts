import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppRedisService } from './app-redis.service';
import Redis from 'ioredis';
import * as msgpack from '@msgpack/msgpack';

jest.mock('ioredis');
jest.mock('@msgpack/msgpack');

describe('AppRedisService', () => {
  let service: AppRedisService;
  let configServiceMock: jest.Mocked<ConfigService>;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRedisService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppRedisService>(AppRedisService);
    configServiceMock = module.get(ConfigService) as jest.Mocked<ConfigService>;
    redisMock = new Redis() as jest.Mocked<Redis>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Redis client', () => {
      configServiceMock.getOrThrow
        .mockReturnValueOnce('6379')
        .mockReturnValueOnce('localhost');

      service.onModuleInit();

      expect(Redis).toHaveBeenCalledWith({
        port: '6379',
        host: 'localhost',
      });
    });
  });

  describe('set', () => {
    it('should set a key-value pair', async () => {
      const key = 'testKey';
      const value = 'testValue';
      redisMock.set.mockResolvedValue('OK');

      // i casted to any because client is private
      (service as any).client = redisMock;
      await service.set(key, value);

      expect(redisMock.set).toHaveBeenCalledWith(key, value);
    });
  });

  describe('get', () => {
    it('should get a value by key', async () => {
      const key = 'testKey';
      const value = 'testValue';
      redisMock.get.mockResolvedValue(value);

      (service as any).client = redisMock;
      const result = await service.get(key);

      expect(redisMock.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      const key = 'testKey';
      redisMock.del.mockResolvedValue(1);

      (service as any).client = redisMock;
      await service.del(key);

      expect(redisMock.del).toHaveBeenCalledWith(key);
    });
  });

  describe('setObj', () => {
    it('should set an object', async () => {
      const key = 'testKey';
      const obj = { test: 'value' };
      const encodedData = Buffer.from('encoded');
      (msgpack.encode as jest.Mock).mockReturnValue(encodedData);
      redisMock.set.mockResolvedValue('OK');

      (service as any).client = redisMock;
      await service.setObj(key, obj);

      expect(msgpack.encode).toHaveBeenCalledWith(obj);
      expect(redisMock.set).toHaveBeenCalledWith(
        key,
        encodedData.toString('binary'),
      );
    });
  });

  describe('getObj', () => {
    it('should get an object', async () => {
      const key = 'testKey';
      const obj = { test: 'value' };
      const encodedData = 'encoded';
      redisMock.get.mockResolvedValue(encodedData);
      (msgpack.decode as jest.Mock).mockReturnValue(obj);

      (service as any).client = redisMock;
      const result = await service.getObj(key);

      expect(redisMock.get).toHaveBeenCalledWith(key);
      expect(msgpack.decode).toHaveBeenCalledWith(
        Buffer.from(encodedData, 'binary'),
      );
      expect(result).toEqual(obj);
    });
  });
});
