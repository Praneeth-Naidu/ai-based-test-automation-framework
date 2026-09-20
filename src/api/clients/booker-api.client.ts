import { APIRequestContext, expect } from '@playwright/test';
import { config } from '../../config/env';
import { Booking, BookingResponse } from '../types';

/**
 * Typed wrapper around restful-booker. This API has a few known quirks
 * (see bug-reports/) — the client itself stays neutral and just reports
 * what the API actually returned; tests decide what's a bug.
 */
export class BookerApiClient {
  private token: string | null = null;

  constructor(private request: APIRequestContext) {}

  async authenticate(): Promise<string> {
    const res = await this.request.post(`${config.booker.apiUrl}/auth`, {
      data: { username: config.booker.username, password: config.booker.password },
    });
    expect(res.ok(), `auth failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    this.token = body.token;
    return body.token;
  }

  async createBooking(booking: Booking): Promise<BookingResponse> {
    const res = await this.request.post(`${config.booker.apiUrl}/booking`, { data: booking });
    expect(res.ok(), `createBooking failed: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  async getBooking(id: number): Promise<Booking> {
    const res = await this.request.get(`${config.booker.apiUrl}/booking/${id}`);
    expect(res.ok(), `getBooking failed: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  /** Returns the raw response so tests can assert on status/body themselves. */
  async updateBooking(id: number, booking: Partial<Booking>) {
    if (!this.token) await this.authenticate();
    return this.request.patch(`${config.booker.apiUrl}/booking/${id}`, {
      headers: { Cookie: `token=${this.token}` },
      data: booking,
    });
  }

  async deleteBooking(id: number) {
    if (!this.token) await this.authenticate();
    return this.request.delete(`${config.booker.apiUrl}/booking/${id}`, {
      headers: { Cookie: `token=${this.token}` },
    });
  }
}
