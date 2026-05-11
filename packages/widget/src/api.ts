export class WidgetApi {
  constructor(private baseUrl: string, private token: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return data;
  }

  async listTemplates(params?: Record<string, string>): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/api/templates${query}`);
  }

  async getTemplate(id: string): Promise<any> {
    return this.request(`/api/templates/${id}`);
  }

  async useTemplate(id: string): Promise<any> {
    return this.request(`/api/templates/${id}/use`);
  }

  async createTemplate(data: any): Promise<any> {
    return this.request('/api/templates', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTemplate(id: string, data: any): Promise<any> {
    return this.request(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTemplate(id: string): Promise<any> {
    return this.request(`/api/templates/${id}`, { method: 'DELETE' });
  }

  async searchDrugs(q: string): Promise<any> {
    return this.request(`/api/drugs/search?q=${encodeURIComponent(q)}&limit=20`);
  }

  async searchICD11(q: string): Promise<any> {
    return this.request(`/api/icd/search?q=${encodeURIComponent(q)}`);
  }
}
