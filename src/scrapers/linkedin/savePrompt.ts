import type { ExtractedJob } from './extractor';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function nameHue(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % 360;
}

const CSS = `
  @keyframes ea-in {
    from { transform: translateX(calc(100% + 32px)); opacity: 0; }
    to   { transform: translateX(0);                 opacity: 1; }
  }
  @keyframes ea-out {
    from { transform: translateX(0);                 opacity: 1; }
    to   { transform: translateX(calc(100% + 32px)); opacity: 0; }
  }
  :host {
    all: initial;
    position: fixed;
    top: 72px;
    right: 24px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    min-width: 288px;
    max-width: 328px;
    box-shadow:
      0 8px 32px rgba(0,0,0,0.14),
      0 2px 8px rgba(0,0,0,0.08),
      0 0 0 1px rgba(0,0,0,0.06);
    animation: ea-in 0.44s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .card.leaving {
    animation: ea-out 0.26s ease-in forwards;
  }
  .accent {
    height: 4px;
    background: linear-gradient(90deg, #0a66c2 0%, #0096cc 100%);
  }
  .body {
    padding: 14px 16px 16px;
  }
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #0a66c2;
  }
  .close {
    background: none;
    border: none;
    color: #aaa;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 6px;
    transition: background 0.15s, color 0.15s;
  }
  .close:hover { background: #f0f0f0; color: #333; }
  .job-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: 0.5px;
  }
  .job-info { flex: 1; min-width: 0; }
  .company {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .role {
    font-size: 12px;
    color: #444;
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .location {
    font-size: 11px;
    color: #888;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .actions { display: flex; gap: 8px; }
  .save-btn {
    flex: 1;
    background: #0a66c2;
    color: #fff;
    border: none;
    border-radius: 24px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .save-btn:hover:not(:disabled) { background: #004182; }
  .save-btn:active:not(:disabled) { transform: scale(0.97); }
  .save-btn:disabled { background: #b0cde8; cursor: default; }
  .skip-btn {
    background: #fff;
    color: #555;
    border: 1.5px solid #d0d0d0;
    border-radius: 24px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .skip-btn:hover { border-color: #999; color: #111; }
`;

export interface SavePromptHandle {
  remove: () => void;
}

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

  // Accent bar
  const accent = document.createElement('div');
  accent.className = 'accent';

  // Body
  const body = document.createElement('div');
  body.className = 'body';

  // Top row: badge + close
  const topRow = document.createElement('div');
  topRow.className = 'top-row';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = 'EasyApply';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.addEventListener('click', () => { animatedRemove(); onDismiss(); });

  topRow.appendChild(badge);
  topRow.appendChild(closeBtn);

  // Job row: avatar + info
  const jobRow = document.createElement('div');
  jobRow.className = 'job-row';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  const companyName = job.company || 'Unknown';
  const hue = nameHue(companyName);
  avatar.style.background = `hsl(${hue}, 52%, 40%)`;
  avatar.textContent = initials(companyName) || '?';

  const jobInfo = document.createElement('div');
  jobInfo.className = 'job-info';

  const companyEl = document.createElement('p');
  companyEl.className = 'company';
  companyEl.textContent = companyName;

  const roleEl = document.createElement('p');
  roleEl.className = 'role';
  roleEl.textContent = job.role || 'Position';

  jobInfo.appendChild(companyEl);
  jobInfo.appendChild(roleEl);

  if (job.location) {
    const locationEl = document.createElement('p');
    locationEl.className = 'location';
    locationEl.textContent = `📍 ${job.location}`;
    jobInfo.appendChild(locationEl);
  }

  jobRow.appendChild(avatar);
  jobRow.appendChild(jobInfo);

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save Application';
  saveBtn.addEventListener('click', () => {
    saveBtn.textContent = 'Saved ✓';
    saveBtn.disabled = true;
    onSave();
    setTimeout(() => animatedRemove(), 1600);
  });

  const skipBtn = document.createElement('button');
  skipBtn.className = 'skip-btn';
  skipBtn.textContent = 'Skip';
  skipBtn.addEventListener('click', () => { animatedRemove(); onDismiss(); });

  actions.appendChild(saveBtn);
  actions.appendChild(skipBtn);

  body.appendChild(topRow);
  body.appendChild(jobRow);
  body.appendChild(actions);

  card.appendChild(accent);
  card.appendChild(body);
  shadow.appendChild(card);
  document.body.appendChild(host);

  function animatedRemove() {
    if (!host.isConnected) return;
    card.classList.add('leaving');
    setTimeout(() => { if (host.isConnected) host.remove(); }, 260);
  }

  return { remove: animatedRemove };
}
