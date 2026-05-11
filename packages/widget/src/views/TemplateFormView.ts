import { WidgetApi } from '../api';
import { EventEmitter } from '../EventEmitter';
import type { PrescriptionTemplate, TemplateDrugItem, TemplateFinding, DrugCatalogItem, ICD11Result } from '../types';

export class TemplateFormView {
  private container: HTMLElement;
  private drugItems: TemplateDrugItem[] = [];
  private findings: TemplateFinding[] = [];
  private icdCode = '';
  private icdDescription = '';
  private icdResults: ICD11Result[] = [];
  private drugResults: DrugCatalogItem[] = [];
  private icdModal: HTMLElement | null = null;

  constructor(
    container: HTMLElement,
    private api: WidgetApi,
    private emitter: EventEmitter,
    private template?: PrescriptionTemplate
  ) {
    this.container = container;
    if (template) {
      this.drugItems = [...template.drugItems];
      this.findings = [...template.findings];
      this.icdCode = template.icd11Code;
      this.icdDescription = template.icd11Description || '';
    }
  }

  render(): void {
    const isEdit = !!this.template;
    const html = `
      <div class="spt-header">
        <h2>${isEdit ? 'Edit' : 'Create'} Template</h2>
        <button class="spt-btn spt-btn-default" data-action="back">&larr; Back</button>
      </div>
      <div class="spt-form">
        <div class="spt-form-row">
          <div class="spt-form-group">
            <label>Template Name *</label>
            <input class="spt-input" data-field="templateName" value="${this.escapeAttr(this.template?.templateName || '')}" placeholder="e.g., Malaria Treatment Protocol" />
          </div>
          <div class="spt-form-group">
            <label>ICD-11 Diagnosis *</label>
            <div class="spt-icd-selector" style="display:flex;align-items:center;gap:8px">
              <div data-field="icd-display" style="flex:1;font-size:13px;color:${this.icdCode ? '#333' : '#999'}">
                ${this.icdCode ? `<span style="background:#e6f4ff;border:1px solid #91caff;border-radius:4px;padding:2px 8px;margin-right:8px;font-size:12px">${this.escapeHtml(this.icdCode)}</span>${this.escapeHtml(this.icdDescription)}` : 'No diagnosis selected'}
              </div>
              <button class="spt-btn ${this.icdCode ? 'spt-btn-default' : 'spt-btn-primary'}" data-action="open-ect">${this.icdCode ? 'Change' : 'Select Diagnosis'}</button>
            </div>
          </div>
        </div>
        <div class="spt-form-group">
          <label>Description</label>
          <textarea class="spt-textarea" data-field="description" rows="2" placeholder="Brief description">${this.escapeHtml(this.template?.description || '')}</textarea>
        </div>
        <div class="spt-form-group">
          <label>Visibility</label>
          <select class="spt-select" data-field="visibility">
            <option value="PRIVATE" ${(!this.template || this.template.visibility === 'PRIVATE') ? 'selected' : ''}>Private</option>
            <option value="PUBLIC" ${this.template?.visibility === 'PUBLIC' ? 'selected' : ''}>Public</option>
          </select>
        </div>
        <hr class="spt-divider" />
        <div class="spt-form-group">
          <label>Clinical Findings</label>
          <div data-container="findings">${this.renderFindings()}</div>
          <button class="spt-btn spt-btn-default" data-action="add-finding" style="margin-top:8px">+ Add Finding</button>
        </div>
        <hr class="spt-divider" />
        <div class="spt-form-group">
          <label>Prescribing Instructions</label>
          <textarea class="spt-textarea" data-field="instructions" rows="3" placeholder="Guidelines...">${this.escapeHtml(this.template?.instructions || '')}</textarea>
        </div>
        <hr class="spt-divider" />
        <div class="spt-form-group">
          <label>Medications *</label>
          <div class="spt-autocomplete">
            <input class="spt-input" data-field="drug-search" placeholder="Search PPB drug catalog..." style="width:100%" />
            <div class="spt-autocomplete-dropdown" data-dropdown="drug" style="display:none"></div>
          </div>
          <div data-container="drugs" style="margin-top:12px">${this.renderDrugTable()}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button class="spt-btn spt-btn-default" data-action="back">Cancel</button>
          <button class="spt-btn spt-btn-primary" data-action="save">${isEdit ? 'Update' : 'Create'} Template</button>
        </div>
      </div>
    `;
    this.container.innerHTML = html;
    this.bindEvents();
  }

  private renderFindings(): string {
    if (this.findings.length === 0) return '<div class="spt-empty" style="padding:8px">No findings added</div>';
    return this.findings.map((f, i) => `
      <div style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
        <input class="spt-input" value="${this.escapeAttr(f.finding)}" data-finding="${i}" data-prop="finding" placeholder="Finding" style="flex:2" />
        <select class="spt-select" data-finding="${i}" data-prop="findingType">
          ${['OBSERVATION','SYMPTOM','SIGN','VITAL','LAB_RESULT'].map(t => `<option value="${t}" ${f.findingType===t?'selected':''}>${t}</option>`).join('')}
        </select>
        <label style="font-size:12px;white-space:nowrap"><input type="checkbox" data-finding="${i}" data-prop="isRequired" ${f.isRequired?'checked':''} /> Req</label>
        <button class="spt-btn spt-btn-danger spt-btn-sm" data-action="remove-finding" data-index="${i}">&times;</button>
      </div>
    `).join('');
  }

  private renderDrugTable(): string {
    if (this.drugItems.length === 0) return '<div class="spt-empty" style="padding:8px">No drugs added</div>';
    let html = '<table class="spt-table"><thead><tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Route</th><th></th></tr></thead><tbody>';
    for (let i = 0; i < this.drugItems.length; i++) {
      const d = this.drugItems[i];
      html += `<tr>
        <td>${this.escapeHtml(d.drugName)}</td>
        <td><input class="spt-input" value="${this.escapeAttr(d.dosage||'')}" data-drug="${i}" data-prop="dosage" style="width:80px" /></td>
        <td><input class="spt-input" value="${this.escapeAttr(d.frequency||'')}" data-drug="${i}" data-prop="frequency" style="width:100px" /></td>
        <td><input class="spt-input" value="${d.duration||''}" data-drug="${i}" data-prop="duration" type="number" style="width:50px" /> days</td>
        <td><input class="spt-input" value="${this.escapeAttr(d.routeOfAdministration||'')}" data-drug="${i}" data-prop="routeOfAdministration" style="width:80px" /></td>
        <td><button class="spt-btn spt-btn-danger spt-btn-sm" data-action="remove-drug" data-index="${i}">&times;</button></td>
      </tr>`;
    }
    html += '</tbody></table>';
    return html;
  }

  private bindEvents(): void {
    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.emitter.emit('navigate', 'list');
    });

    this.container.querySelector('[data-action="save"]')?.addEventListener('click', () => this.handleSave());
    this.container.querySelector('[data-action="add-finding"]')?.addEventListener('click', () => {
      this.findings.push({ finding: '', findingType: 'OBSERVATION', isRequired: false });
      this.refreshFindings();
    });

    this.bindIcdSearch();
    this.bindDrugSearch();
    this.bindDynamicInputs();
  }

  private bindIcdSearch(): void {
    this.container.querySelector('[data-action="open-ect"]')?.addEventListener('click', () => {
      this.openIcdModal();
    });
  }

  private openIcdModal(): void {
    this.icdModal = document.createElement('div');
    this.icdModal.className = 'spt-modal-overlay';
    this.icdModal.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center';
    this.icdModal.innerHTML = `
      <div class="spt-modal" style="background:#fff;border-radius:8px;width:640px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 6px 16px rgba(0,0,0,0.12)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-bottom:1px solid #f0f0f0">
          <h3 style="margin:0;font-size:16px">ICD-11 — Search &amp; Select Diagnosis</h3>
          <button data-action="close-icd" style="border:none;background:none;font-size:20px;cursor:pointer;padding:4px 8px;color:#666">&times;</button>
        </div>
        <div style="padding:16px 24px 8px">
          <input class="spt-input" data-field="icd-modal-search" placeholder="Type to search (e.g. malaria, diabetes, hypertension...)" style="width:100%;font-size:14px;padding:10px 12px" autofocus />
        </div>
        <div data-container="icd-results" style="flex:1;overflow-y:auto;padding:0 24px 16px;max-height:55vh">
          <div style="color:#999;text-align:center;padding:32px">Start typing to search ICD-11 diagnoses</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.icdModal);

    this.icdModal.querySelector('[data-action="close-icd"]')?.addEventListener('click', () => {
      this.closeIcdModal();
    });

    this.icdModal.addEventListener('click', (e) => {
      if (e.target === this.icdModal) this.closeIcdModal();
    });

    const input = this.icdModal.querySelector('[data-field="icd-modal-search"]') as HTMLInputElement;
    const resultsContainer = this.icdModal.querySelector('[data-container="icd-results"]') as HTMLElement;
    let timeout: ReturnType<typeof setTimeout>;
    let currentResults: ICD11Result[] = [];

    input?.addEventListener('input', () => {
      clearTimeout(timeout);
      const q = input.value;
      if (q.length < 2) {
        currentResults = [];
        resultsContainer.innerHTML = '<div style="color:#999;text-align:center;padding:32px">Start typing to search ICD-11 diagnoses</div>';
        return;
      }
      resultsContainer.innerHTML = '<div style="text-align:center;padding:32px;color:#999">Searching...</div>';
      timeout = setTimeout(async () => {
        try {
          const res = await this.api.searchICD11(q);
          currentResults = res.data?.results || [];
          if (currentResults.length === 0) {
            resultsContainer.innerHTML = '<div style="text-align:center;padding:32px;color:#999">No results found</div>';
          } else {
            resultsContainer.innerHTML = currentResults.map((r, i) => `
              <div class="spt-autocomplete-item" data-icd-modal-idx="${i}" style="padding:10px 12px;border-bottom:1px solid #f5f5f5;cursor:pointer">
                <span style="background:#e6f4ff;border:1px solid #91caff;border-radius:4px;padding:2px 8px;font-size:12px;margin-right:8px">${this.escapeHtml(r.code)}</span>
                ${this.escapeHtml(r.title)}
              </div>
            `).join('');
          }
        } catch {
          resultsContainer.innerHTML = '<div style="text-align:center;padding:32px;color:#f5222d">Search failed</div>';
        }
      }, 350);
    });

    resultsContainer.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('[data-icd-modal-idx]') as HTMLElement;
      if (!item) return;
      const idx = parseInt(item.dataset.icdModalIdx!);
      const selected = currentResults[idx];
      if (selected) {
        this.icdCode = selected.code;
        this.icdDescription = selected.title;
        this.refreshIcdDisplay();
        this.closeIcdModal();
      }
    });

    setTimeout(() => input?.focus(), 50);
  }

  private closeIcdModal(): void {
    if (this.icdModal) {
      document.body.removeChild(this.icdModal);
      this.icdModal = null;
    }
  }

  private refreshIcdDisplay(): void {
    const display = this.container.querySelector('[data-field="icd-display"]') as HTMLElement;
    if (display) {
      if (this.icdCode) {
        display.style.color = '#333';
        display.innerHTML = `<span style="background:#e6f4ff;border:1px solid #91caff;border-radius:4px;padding:2px 8px;margin-right:8px;font-size:12px">${this.escapeHtml(this.icdCode)}</span>${this.escapeHtml(this.icdDescription)}`;
      } else {
        display.style.color = '#999';
        display.innerHTML = 'No diagnosis selected';
      }
    }
    const btn = this.container.querySelector('[data-action="open-ect"]') as HTMLElement;
    if (btn) {
      btn.textContent = this.icdCode ? 'Change' : 'Select Diagnosis';
      btn.className = `spt-btn ${this.icdCode ? 'spt-btn-default' : 'spt-btn-primary'}`;
    }
  }

  private bindDrugSearch(): void {
    const input = this.container.querySelector('[data-field="drug-search"]') as HTMLInputElement;
    const dropdown = this.container.querySelector('[data-dropdown="drug"]') as HTMLElement;
    let timeout: ReturnType<typeof setTimeout>;

    input?.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (input.value.length < 2) { dropdown.style.display = 'none'; return; }
        try {
          const res = await this.api.searchDrugs(input.value);
          this.drugResults = res.data?.drugs || [];
          dropdown.innerHTML = this.drugResults.map((d, i) => `
            <div class="spt-autocomplete-item" data-drug-idx="${i}">
              <strong>${this.escapeHtml(d.genericName)}</strong>
              <div style="font-size:11px;color:#666">${[d.strength,d.dosageForm,d.route].filter(Boolean).join(' | ')}</div>
            </div>
          `).join('') || '<div class="spt-autocomplete-item">No results</div>';
          dropdown.style.display = 'block';
        } catch { dropdown.style.display = 'none'; }
      }, 300);
    });

    dropdown?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('[data-drug-idx]') as HTMLElement;
      if (!item) return;
      const idx = parseInt(item.dataset.drugIdx!);
      const drug = this.drugResults[idx];
      if (drug && !this.drugItems.some(d => d.drugCode === drug.genericConceptCode)) {
        this.drugItems.push({
          drugCode: drug.genericConceptCode,
          drugName: drug.genericName,
          dosage: '',
          frequency: '',
          routeOfAdministration: drug.route || '',
        });
        this.refreshDrugs();
      }
      input.value = '';
      dropdown.style.display = 'none';
    });

    input?.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  }

  private bindDynamicInputs(): void {
    this.container.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.dataset.drug !== undefined && el.dataset.prop) {
        const idx = parseInt(el.dataset.drug);
        const prop = el.dataset.prop as keyof TemplateDrugItem;
        (this.drugItems[idx] as any)[prop] = prop === 'duration' ? parseInt(el.value) || undefined : el.value;
      }
      if (el.dataset.finding !== undefined && el.dataset.prop) {
        const idx = parseInt(el.dataset.finding);
        const prop = el.dataset.prop;
        if (prop === 'isRequired') {
          this.findings[idx].isRequired = (el as HTMLInputElement).checked;
        } else {
          (this.findings[idx] as any)[prop] = el.value;
        }
      }
    });

    this.container.addEventListener('change', (e) => {
      const el = e.target as HTMLSelectElement | HTMLInputElement;
      if (el.dataset.finding !== undefined && el.dataset.prop) {
        const idx = parseInt(el.dataset.finding);
        const prop = el.dataset.prop;
        if (prop === 'isRequired') {
          this.findings[idx].isRequired = (el as HTMLInputElement).checked;
        } else {
          (this.findings[idx] as any)[prop] = el.value;
        }
      }
    });

    this.container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index || '0');
      if (action === 'remove-drug') { this.drugItems.splice(index, 1); this.refreshDrugs(); }
      if (action === 'remove-finding') { this.findings.splice(index, 1); this.refreshFindings(); }
    });
  }

  private refreshDrugs(): void {
    const container = this.container.querySelector('[data-container="drugs"]');
    if (container) container.innerHTML = this.renderDrugTable();
  }

  private refreshFindings(): void {
    const container = this.container.querySelector('[data-container="findings"]');
    if (container) container.innerHTML = this.renderFindings();
  }

  private async handleSave(): Promise<void> {
    const get = (field: string) => (this.container.querySelector(`[data-field="${field}"]`) as HTMLInputElement)?.value || '';
    const templateName = get('templateName');

    if (!templateName) { alert('Template name is required'); return; }
    if (!this.icdCode) { alert('Please select an ICD-11 diagnosis'); return; }
    if (this.drugItems.length === 0) { alert('Please add at least one medication'); return; }

    const payload = {
      templateName,
      description: get('description'),
      icd11Code: this.icdCode,
      icd11Description: this.icdDescription,
      visibility: get('visibility') || 'PRIVATE',
      instructions: get('instructions'),
      findings: this.findings.filter(f => f.finding.trim()),
      drugItems: this.drugItems.map((d, i) => ({ ...d, sortOrder: i })),
    };

    try {
      let result;
      if (this.template) {
        result = await this.api.updateTemplate(this.template.id, payload);
        this.emitter.emit('template:updated', result.data);
      } else {
        result = await this.api.createTemplate(payload);
        this.emitter.emit('template:created', result.data);
      }
      this.emitter.emit('navigate', 'list');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
      this.emitter.emit('error', err);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeAttr(text: string): string {
    return text.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
}
