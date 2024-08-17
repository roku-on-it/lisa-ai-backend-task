import { Injectable, Logger } from '@nestjs/common';
import { isIP } from 'class-validator';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type Response = {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};

@Injectable()
export class TimezoneService {
  constructor(private http: HttpService) {}

  // Returns the timezone of the user's IP address in IANA format
  async fromIPV4(addr: string): Promise<string> {
    if (!isIP(addr, 4)) {
      throw new Error('Invalid IPv4 address provided');
    }

    const response = await firstValueFrom(this.http.get(addr));

    if (response.status !== 200) {
      Logger.error(`${this.constructor.name}#fromIPV4`);
      console.error(response);
      throw new Error('Failed to fetch timezone information');
    }

    if (response.data.status !== 'success') {
      Logger.error(`${this.constructor.name}#fromIPV4`);
      console.error(response);
      throw new Error('Failed to get timezone information');
    }

    return response.data.timezone;
  }
}
