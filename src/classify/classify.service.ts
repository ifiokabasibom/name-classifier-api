import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClassifyService {
  constructor(private readonly httpService: HttpService) {}

  async classifyName(name: string) {
    try {
      const url = `https://api.genderize.io?name=${name}`;

      const response = await firstValueFrom(
        this.httpService.get(url),
      );

      const { gender, probability, count } = response.data;

      // Edge case requirement
      if (!gender || count === 0) {
        throw new HttpException(
          {
            status: 'error',
            message: 'No prediction available for the provided name',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const is_confident =
        probability >= 0.7 && count >= 100;

      return {
        status: 'success',
        data: {
          name,
          gender,
          probability,
          sample_size: count,
          is_confident,
          processed_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Upstream or server failure',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}



