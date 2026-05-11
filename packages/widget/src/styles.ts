export const WIDGET_CSS = `
.spt-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333; }
.spt-widget * { box-sizing: border-box; }
.spt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.spt-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
.spt-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.spt-input { padding: 6px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; outline: none; }
.spt-input:focus { border-color: #4264D0; box-shadow: 0 0 0 2px rgba(66,100,208,0.1); }
.spt-btn { padding: 6px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s; }
.spt-btn-primary { background: #4264D0; color: #fff; }
.spt-btn-primary:hover { background: #3451A8; }
.spt-btn-danger { background: #ff4d4f; color: #fff; }
.spt-btn-default { background: #f0f0f0; color: #333; border: 1px solid #d9d9d9; }
.spt-btn-sm { padding: 4px 10px; font-size: 12px; }
.spt-card { border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; background: #fff; transition: box-shadow 0.2s; }
.spt-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.spt-card-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.spt-card-meta { color: #666; font-size: 12px; }
.spt-card-actions { display: flex; gap: 4px; margin-top: 8px; }
.spt-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.spt-tag-blue { background: #e6f0ff; color: #1d4ed8; }
.spt-tag-green { background: #e6f9ed; color: #15803d; }
.spt-tag-gray { background: #f0f0f0; color: #666; }
.spt-empty { text-align: center; padding: 40px; color: #999; }
.spt-form { display: flex; flex-direction: column; gap: 16px; }
.spt-form-group { display: flex; flex-direction: column; gap: 4px; }
.spt-form-group label { font-size: 13px; font-weight: 500; color: #333; }
.spt-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.spt-textarea { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; resize: vertical; min-height: 60px; font-family: inherit; }
.spt-textarea:focus { border-color: #4264D0; outline: none; }
.spt-select { padding: 6px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; background: #fff; }
.spt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.spt-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e8e8e8; font-weight: 600; color: #666; }
.spt-table td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
.spt-divider { border: none; border-top: 1px solid #e8e8e8; margin: 16px 0; }
.spt-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #e8e8e8; border-top-color: #4264D0; border-radius: 50%; animation: spt-spin 0.6s linear infinite; }
@keyframes spt-spin { to { transform: rotate(360deg); } }
.spt-loading { display: flex; justify-content: center; padding: 24px; }
.spt-autocomplete { position: relative; }
.spt-autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.spt-autocomplete-item { padding: 8px 12px; cursor: pointer; }
.spt-autocomplete-item:hover { background: #f5f5f5; }
.spt-pagination { display: flex; justify-content: center; gap: 4px; margin-top: 16px; }
.spt-pagination button { min-width: 32px; height: 32px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; }
.spt-pagination button.active { background: #4264D0; color: #fff; border-color: #4264D0; }
`;

export function injectStyles(container: HTMLElement): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = WIDGET_CSS;
  container.prepend(style);
  return style;
}
