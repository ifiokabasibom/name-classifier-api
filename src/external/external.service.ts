import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalService {
  private async safeGet(url: string) {
    try {
      const res = await axios.get(url, {
        timeout: 4000, // 🔥 critical: prevents hanging requests
        validateStatus: () => true,
      });

      if (!res.data) {
        throw new Error('Empty response');
      }

      return res.data;
    } catch (err) {
      throw new Error(url);
    }
  }

  async getGender(name: string) {
    try {
      const data = await this.safeGet(
        `https://api.genderize.io?name=${name}`,
      );

      if (!data.gender || data.count === 0) {
        throw new Error();
      }

      return data;
    } catch {
      throw new HttpException(
        {
          status: 'error',
          message: 'Genderize returned an invalid response',
        },
        502,
      );
    }
  }

  async getAge(name: string) {
    try {
      const data = await this.safeGet(
        `https://api.agify.io?name=${name}`,
      );

      if (!data.age) {
        throw new Error();
      }

      return data;
    } catch {
      throw new HttpException(
        {
          status: 'error',
          message: 'Agify returned an invalid response',
        },
        502,
      );
    }
  }

  async getNationality(name: string) {
    try {
      const data = await this.safeGet(
        `https://api.nationalize.io?name=${name}`,
      );

      if (!data.country || data.country.length === 0) {
        throw new Error();
      }

      return data;
    } catch {
      throw new HttpException(
        {
          status: 'error',
          message: 'Nationalize returned an invalid response',
        },
        502,
      );
    }
  }
}