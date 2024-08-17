import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { TimezoneService } from './timezone.service';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('TimezoneService', () => {
  let service: TimezoneService;
  let httpServiceMock: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezoneService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimezoneService>(TimezoneService);
    httpServiceMock = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fromIPV4', () => {
    it('should throw an error for invalid IPv4 address', async () => {
      await expect(service.fromIPV4('invalid-ip')).rejects.toThrow(
        'Invalid IPv4 address provided',
      );
    });

    it('should return timezone for valid IPv4 address', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined,
        headers: undefined,
        statusText: '',
        status: 200,
        data: {
          status: 'success',
          timezone: 'America/New_York',
        },
      };
      httpServiceMock.get.mockReturnValue(of(mockResponse));
      const result = await service.fromIPV4('8.8.8.8');
      expect(result).toBe('America/New_York');
    });

    it('should throw an error when HTTP request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('Failed to fetch timezone information')),
      );

      await expect(service.fromIPV4('8.8.8.8')).rejects.toThrow(
        'Failed to fetch timezone information',
      );
    });

    it('should throw an error when response status is not 200', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined,
        headers: undefined,
        statusText: '',
        status: 404,
        data: {},
      };
      httpServiceMock.get.mockReturnValue(of(mockResponse));

      await expect(service.fromIPV4('8.8.8.8')).rejects.toThrow(
        'Failed to fetch timezone information',
      );
    });

    it('should throw an error when response data status is not success', async () => {
      const mockResponse: AxiosResponse = {
        config: undefined,
        headers: undefined,
        statusText: '',
        status: 200,
        data: {
          status: 'fail',
        },
      };
      httpServiceMock.get.mockReturnValue(of(mockResponse));

      await expect(service.fromIPV4('8.8.8.8')).rejects.toThrow(
        'Failed to get timezone information',
      );
    });

    it('should log errors when request fails', async () => {
      const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockResponse: AxiosResponse = {
        config: undefined,
        headers: undefined,
        statusText: '',
        status: 404,
        data: {},
      };
      httpServiceMock.get.mockReturnValue(of(mockResponse));

      await expect(service.fromIPV4('8.8.8.8')).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      loggerSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
