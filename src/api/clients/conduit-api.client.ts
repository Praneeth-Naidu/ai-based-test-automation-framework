import { APIRequestContext, expect } from '@playwright/test';
import { config } from '../../config/env';
import {
  ConduitUser,
  ConduitAuthResponse,
  ConduitArticleInput,
  ConduitArticleResponse,
} from '../types';

/**
 * Thin, typed wrapper around the Conduit REST API.
 * Tests should never build raw request bodies inline — every call
 * here is a single, reusable unit that both API and UI tests use
 * (e.g. UI tests register/login via this client instead of the form,
 * so a UI spec tests the UI, not the auth flow underneath it).
 */
export class ConduitApiClient {
  private token: string | null = null;

  constructor(private request: APIRequestContext) {}

  async register(user: ConduitUser): Promise<ConduitAuthResponse> {
    const res = await this.request.post(`${config.conduit.apiUrl}/users`, {
      data: { user },
    });
    await this.assertOk(res, 'register');
    const body = (await res.json()) as ConduitAuthResponse;
    this.token = body.user.token;
    return body;
  }

  /**
   * A non-2xx from an infra layer (Cloudflare, a proxy, a load balancer)
   * often comes back as an HTML error page, not JSON. Dumping that raw
   * into an assertion message buries the actual signal, so trim it and
   * label it distinctly from a real API error response.
   */
  private async assertOk(res: import('@playwright/test').APIResponse, label: string) {
    if (res.ok()) return;
    const contentType = res.headers()['content-type'] ?? '';
    const detail = contentType.includes('application/json')
      ? await res.text()
      : `non-JSON response (likely an infra/CDN error, not the app) — first 200 chars: ${(
          await res.text()
        ).slice(0, 200)}`;
    expect(res.ok(), `${label} failed: ${res.status()} — ${detail}`).toBeTruthy();
  }

  async login(email: string, password: string): Promise<ConduitAuthResponse> {
    const res = await this.request.post(`${config.conduit.apiUrl}/users/login`, {
      data: { user: { email, password } },
    });
    await this.assertOk(res, 'login');
    const body = (await res.json()) as ConduitAuthResponse;
    this.token = body.user.token;
    return body;
  }

  /** Auth header for the currently logged-in user. Throws if not logged in. */
  private authHeader(): { Authorization: string } {
    if (!this.token) {
      throw new Error('ConduitApiClient: no token set — call register() or login() first');
    }
    return { Authorization: `Token ${this.token}` };
  }

  async createArticle(input: ConduitArticleInput): Promise<ConduitArticleResponse> {
    const res = await this.request.post(`${config.conduit.apiUrl}/articles`, {
      headers: this.authHeader(),
      data: { article: input },
    });
    expect(res.ok(), `createArticle failed: ${res.status()} ${await res.text()}`).toBeTruthy();
    return res.json();
  }

  async getArticle(slug: string): Promise<ConduitArticleResponse> {
    const res = await this.request.get(`${config.conduit.apiUrl}/articles/${slug}`);
    expect(res.ok(), `getArticle failed: ${res.status()}`).toBeTruthy();
    return res.json();
  }

  async deleteArticle(slug: string): Promise<void> {
    const res = await this.request.delete(`${config.conduit.apiUrl}/articles/${slug}`, {
      headers: this.authHeader(),
    });
    expect(res.ok(), `deleteArticle failed: ${res.status()}`).toBeTruthy();
  }

  getToken(): string | null {
    return this.token;
  }
}
