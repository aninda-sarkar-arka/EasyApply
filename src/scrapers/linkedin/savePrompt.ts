import type { ExtractedJob } from './extractor';

const CSS = `
  :host {
    all: initial;
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .card {
    background: #0f1923;
    border: 1px solid #1e2d3f;
    border-radius: 12px;
    padding: 16px 18px;
    min-width: 260px;
    max-width: 340px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    color: #e8f0fa;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .brand {
    font-size: 12px;
    font-weight: 700;
    color: #6ea8fe;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .close {
    background: none;
    border: none;
    color: #6b7f99;
    font-size: 18px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
  }
  .close:hover { color: #e8f0fa; }
  .title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 3px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    font-size: 12px;
    color: #8ca2bd;
    margin: 0 0 14px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .actions { display: flex; gap: 8px; }
  .save-btn, .skip-btn {
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    flex: 1;
  }
  .save-btn { background: #6ea8fe; color: #0a1628; }
  .save-btn:hover { background: #93bfff; }
  .save-btn:disabled { background: #2a4a7f; color: #6b7f99; cursor: default; }
  .skip-btn { background: #1a2840; color: #8ca2bd; }
  .skip-btn:hover { background: #1f3251; color: #e8f0fa; }
  .saved-msg {
    font-size: 13px;
    color: #9ff5c4;
    text-align: center;
    padding: 4px 0;
  }
`;

export interface SavePromptHandle {
  remove: () => void;
}

/**
 * Inject a Shadow DOM save-prompt card into the page.
 * Calls `onSave` when the user clicks Save, `onDismiss` for Skip or ×.
 * Returns a handle to remove it programmatically.
 */
export function mountSavePrompt(
  job: ExtractedJob,
  onSave: () => void,
  onDismiss: () => void,
): SavePromptHandle {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  const card = document.createElement('div');
  card.className = 'card';

  // Header row
  const header = document.createElement('div');
  header.className = 'header';

  const brand = document.createElement('span');
  brand.className = 'brand';
  brand.textContent = 'EasyApply';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.addEventListener('click', () => { remove(); onDismiss(); });

  header.appendChild(brand);
  header.appendChild(closeBtn);

  // Body text
  const title = document.createElement('p');
  title.className = 'title';
  title.textContent = job.company || 'Unknown company';

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = job.role ? `${job.role}${job.location ? ` · ${job.location}` : ''}` : 'Save this application?';

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save to EasyApply';
  saveBtn.addEventListener('click', () => {
    saveBtn.textContent = 'Saved!';
    saveBtn.disabled = true;
    onSave();
    setTimeout(() => remove(), 1800);
  });

  const skipBtn = document.createElement('button');
  skipBtn.className = 'skip-btn';
  skipBtn.textContent = 'Skip';
  skipBtn.addEventListener('click', () => { remove(); onDismiss(); });

  actions.appendChild(saveBtn);
  actions.appendChild(skipBtn);

  card.appendChild(header);
  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(actions);
  shadow.appendChild(card);

  document.body.appendChild(host);

  function remove() {
    if (host.isConnected) host.remove();
  }

  return { remove };
}
