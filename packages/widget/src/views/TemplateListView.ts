import { WidgetApi } from '../api';
import { EventEmitter } from '../EventEmitter';
import type { PrescriptionTemplate } from '../types';

export class TemplateListView {
  private container: HTMLElement;
  private templates: PrescriptionTemplate[] = [];
  private total = 0;
  private page = 1;
  private limit = 20;
  private filters: Record<string, string> = {};
  private loading = false;

  constructor(
    container: HTMLElement,
    private api: WidgetApi,
    private emitter: EventEmitter,
    initialFilters?: Record<string, string>
  ) {
    this.container = container;
    if (initialFilters) this.filters = initialFilters;
  }

  async render(): Promise<void> {
    await this.fetchTemplates();
    this.draw();
  }

  private async fetchTemplates(): Promise<void> {
    this.loading = true;
    this.drawLoading();
    try {
      const params: Record<string, string> = { page: String(this.page), limit: String(this.limit), ...this.filters };
      const res = await this.api.listTemplates(params);
      this.templates = res.data || [];
      this.total = res.pagination?.total || 0;
    } catch (err: any) {
      this.emitter.emit('error', err);
      this.templates = [];
    }
    this.loading = false;
  }

  private drawLoading(): void {
    this.container.innerHTML = '<div class="spt-loading"><span class="spt-spinner"></span></div>';
  }

  private draw(): void {
    let html = `
      <div class="spt-header">
        <h2>Prescription Templates</h2>
        <button class="spt-btn spt-btn-primary" data-action="create">+ New Template</button>
      </div>
      <div class="spt-filters">
        <input class="spt-input" placeholder="Search templates..." data-filter="search" value="${this.filters.search || ''}" />
        <input class="spt-input" placeholder="ICD-11 code" data-filter="icd_code" value="${this.filters.icd_code || ''}" style="width:140px" />
        <select class="spt-select" data-filter="visibility">
          <option value="">All</option>
          <option value="PUBLIC" ${this.filters.visibility === 'PUBLIC' ? 'selected' : ''}>Public</option>
          <option value="PRIVATE" ${this.filters.visibility === 'PRIVATE' ? 'selected' : ''}>Private</option>
        </select>
      </div>
    `;

    if (this.templates.length === 0) {
      html += '<div class="spt-empty">No templates found</div>';
    } else {
      for (const tpl of this.templates) {
        const visTag = tpl.visibility === 'PUBLIC'
          ? '<span class="spt-tag spt-tag-green">Public</span>'
          : '<span class="spt-tag spt-tag-gray">Private</span>';
        html += `
          <div class="spt-card" data-id="${tpl.id}">
            <div class="spt-card-title">${this.escapeHtml(tpl.templateName)} ${visTag}</div>
            <div class="spt-card-meta">
              <span class="spt-tag spt-tag-blue">${this.escapeHtml(tpl.icd11Code)}</span>
              ${tpl.icd11Description ? this.escapeHtml(tpl.icd11Description) : ''}
              &middot; ${tpl.drugItems.length} medication(s) &middot; ${tpl.findings.length} finding(s)
            </div>
            <div class="spt-card-actions">
              <button class="spt-btn spt-btn-primary spt-btn-sm" data-action="use" data-id="${tpl.id}">Use Template</button>
              <button class="spt-btn spt-btn-default spt-btn-sm" data-action="edit" data-id="${tpl.id}">Edit</button>
              <button class="spt-btn spt-btn-danger spt-btn-sm" data-action="delete" data-id="${tpl.id}">Delete</button>
            </div>
          </div>
        `;
      }
    }

    if (this.total > this.limit) {
      const pages = Math.ceil(this.total / this.limit);
      html += '<div class="spt-pagination">';
      for (let i = 1; i <= pages; i++) {
        html += `<button data-page="${i}" class="${i === this.page ? 'active' : ''}">${i}</button>`;
      }
      html += '</div>';
    }

    this.container.innerHTML = html;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.container.querySelector('[data-action="create"]')?.addEventListener('click', () => {
      this.emitter.emit('navigate', 'form');
    });

    this.container.querySelectorAll('[data-action="use"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        try {
          const res = await this.api.useTemplate(id);
          this.emitter.emit('template:applied', res.data);
        } catch (err) {
          this.emitter.emit('error', err);
        }
      });
    });

    this.container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        const tpl = this.templates.find((t) => t.id === id);
        if (tpl) this.emitter.emit('navigate', 'form', tpl);
      });
    });

    this.container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        if (!confirm('Delete this template?')) return;
        try {
          await this.api.deleteTemplate(id);
          this.emitter.emit('template:deleted', id);
          await this.render();
        } catch (err) {
          this.emitter.emit('error', err);
        }
      });
    });

    let searchTimeout: ReturnType<typeof setTimeout>;
    this.container.querySelectorAll('[data-filter]').forEach((el) => {
      const input = el as HTMLInputElement | HTMLSelectElement;
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const key = input.dataset.filter!;
          if (input.value) {
            this.filters[key] = input.value;
          } else {
            delete this.filters[key];
          }
          this.page = 1;
          this.render();
        }, 400);
      });
    });

    this.container.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.page = parseInt((btn as HTMLElement).dataset.page!);
        this.render();
      });
    });
  }

  setFilters(filters: Record<string, string>): void {
    this.filters = { ...this.filters, ...filters };
    this.page = 1;
    this.render();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
