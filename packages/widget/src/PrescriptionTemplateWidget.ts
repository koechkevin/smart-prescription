import { EventEmitter } from './EventEmitter';
import { WidgetApi } from './api';
import { injectStyles } from './styles';
import { TemplateListView } from './views/TemplateListView';
import { TemplateFormView } from './views/TemplateFormView';
import type { WidgetOptions, PrescriptionTemplate } from './types';

export class PrescriptionTemplateWidget extends EventEmitter {
  private container: HTMLElement;
  private api: WidgetApi;
  private options: WidgetOptions;
  private styleEl: HTMLStyleElement | null = null;
  private currentView: 'list' | 'form' = 'list';

  constructor(options: WidgetOptions) {
    super();
    this.options = options;
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)!
      : options.container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    this.api = new WidgetApi(options.apiBaseUrl, options.authToken);

    this.on('navigate', (view: string, data?: any) => {
      if (view === 'list') this.showList();
      if (view === 'form') this.showForm(data);
    });
  }

  mount(): void {
    this.container.classList.add('spt-widget');
    this.styleEl = injectStyles(this.container);

    if (this.options.mode === 'form') {
      this.showForm();
    } else {
      this.showList();
    }
  }

  private showList(): void {
    this.currentView = 'list';
    const listView = new TemplateListView(
      this.container,
      this.api,
      this,
      this.options.initialFilters as Record<string, string>
    );
    listView.render();
  }

  private showForm(template?: PrescriptionTemplate): void {
    this.currentView = 'form';
    const formView = new TemplateFormView(this.container, this.api, this, template);
    formView.render();
  }

  setFilters(filters: Record<string, string>): void {
    if (this.currentView === 'list') {
      this.options.initialFilters = { ...this.options.initialFilters, ...filters };
      this.showList();
    }
  }

  refresh(): void {
    if (this.currentView === 'list') this.showList();
  }

  unmount(): void {
    this.container.innerHTML = '';
    this.container.classList.remove('spt-widget');
    this.styleEl?.remove();
  }

  destroy(): void {
    this.unmount();
    this.removeAllListeners();
  }
}
