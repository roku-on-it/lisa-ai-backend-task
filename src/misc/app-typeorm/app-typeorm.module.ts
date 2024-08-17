import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<PostgresConnectionOptions> => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        database: configService.getOrThrow('POSTGRES_DATABASE'),
        port: configService.getOrThrow('POSTGRES_PORT'),
        entities: ['dist/**/*.model.{ts,js}'],
        useUTC: true,
        dropSchema: /true/i.test(configService.getOrThrow('DB_DROP_SCHEMA')),
        synchronize: /true/i.test(configService.getOrThrow('DB_SYNCHRONIZE')),
        logging: /true/i.test(configService.getOrThrow('DB_LOGGING')),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class AppTypeormModule {}
