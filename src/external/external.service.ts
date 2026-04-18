import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalService {
  private async fetchWithRetry(url: string, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await axios.get(url, {
          timeout: 5000,
        });

        return res.data;
      } catch (err) {
        if (attempt === retries) {
          throw new Error(`Failed: ${url}`);
        }
      }
    }
  }

  async getGender(name: string) {
    try {
      return await this.fetchWithRetry(
        `https://api.genderize.io?name=${name}`,
      );
    } catch {
      throw new HttpException(
        { status: 'error', message: 'Genderize returned an invalid response' },
        502,
      );
    }
  }

  async getAge(name: string) {
    try {
      return await this.fetchWithRetry(
        `https://api.agify.io?name=${name}`,
      );
    } catch {
      throw new HttpException(
        { status: 'error', message: 'Agify returned an invalid response' },
        502,
      );
    }
  }

  async getNationality(name: string) {
    try {
      return await this.fetchWithRetry(
        `https://api.nationalize.io?name=${name}`,
      );
    } catch {
      throw new HttpException(
        { status: 'error', message: 'Nationalize returned an invalid response' },
        502,
      );
    }
  }
}