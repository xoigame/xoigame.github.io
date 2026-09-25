const DATA_URL = './data.json';
const GITHUB_CONTENT_URL = 'https://api.github.com/repos/xoigame/xoigame.github.io/contents/gamedevhub/data.json';
const LESSON_TEMPLATE = 'Dự án: \nTên kinh nghiệm: \nLoại (Lesson / Pitfall / Decision / Pattern): \nTình huống: \nTôi đã học được: \nLần sau tôi sẽ: ';

const state = { data: null, selectedId: 'last-tower', openPhases: new Set(['prototype', 'production']), openMilestones: new Set(['prototype-navigation', 'production-bows']), token: '', saving: false };
const $ = (selector) => document.querySelector(selector);
const make = (tag, className, textValue) => { const node = document.createElement(tag); if (className) node.className = className; if (textValue !== undefined) node.textContent = textValue; return node; };
let toastTimer;

function toast(message, isError = false) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.toggle('error', isError);
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 4300);
}

function currentProject() { return state.selectedId === 'template' ? state.data.template : state.data.projects.find(project => project.id === state.selectedId); }
function isTemplate() { return state.selectedId === 'template'; }
function tasksOf(container) { return container.milestones ? container.milestones.flatMap(m => m.tasks) : container.phases.flatMap(phase => tasksOf(phase)); }
function progress(container) { const tasks = tasksOf(container); return { done: tasks.filter(task => task.done === true).length, total: tasks.length }; }
function percentage({ done, total }) { return total ? Math.round(done / total * 100) : 0; }

function setupProjectSelect() {
  const select = $('#project-select');
  select.replaceChildren();
  for (const project of state.data.projects) {
    const option = make('option', '', project.name);
    option.value = project.id;
    select.append(option);
  }
  const templateOption = make('option', '', 'Khuôn mẫu chung · Template');
  templateOption.value = 'template';
  select.append(templateOption);
  select.value = state.selectedId;
}

function renderOverview(project) {
  const p = progress(project);
  $('#hero-percent').textContent = isTemplate() ? '—' : `${percentage(p)}%`;
  $('#hero-count').textContent = isTemplate() ? 'Cấu trúc dùng lại cho mọi game' : `${p.done} / ${p.total} task đã xác nhận`;
  $('#hero-meter-fill').style.width = `${isTemplate() ? 0 : percentage(p)}%`;
  const meta = $('#project-meta');
  meta.replaceChildren();
  meta.append(make('strong', '', project.name), make('p', '', project.description));
  meta.append(make('span', 'tag', isTemplate() ? 'SHARED TEMPLATE' : project.status || 'PROJECT'));
  $('#map-project-name').textContent = project.shortName || project.name;
  $('#map-kind').textContent = isTemplate() ? 'SHARED TEMPLATE' : 'PROJECT MAP';
  $('#map-total').textContent = `${p.total} TASK`;
}

function makeProgressText(p) { return `${p.done}/${p.total}`; }

function taskNode(task, project) {
  const item = make('li');
  const label = make('label', `task-label${task.done ? ' done' : ''}`);
  const checkbox = make('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.done;
  checkbox.disabled = isTemplate() || state.saving;
  checkbox.setAttribute('aria-label', task.title);
  checkbox.addEventListener('change', () => {
    if (!state.token) {
      checkbox.checked = !!task.done;
      openSyncDialog();
      toast('Kết nối GitHub để lưu checklist lên web.');
      return;
    }
    saveTask(project.id, task.id, checkbox.checked);
  });
  const text = make('span', '', task.title);
  if (task.note) text.append(make('small', '', task.note));
  label.append(checkbox, text);
  item.append(label);
  return item;
}

function milestoneNode(milestone, project) {
  const item = make('li', 'milestone-node');
  const expanded = state.openMilestones.has(milestone.id);
  const button = make('button', 'milestone-head');
  button.type = 'button';
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Thu' : 'Bung'} mốc phụ ${milestone.title}`);
  const symbol = make('span', 'milestone-symbol', '◇');
  const title = make('span', 'milestone-title', milestone.title);
  title.append(make('small', '', milestone.keyword));
  button.append(symbol, title, make('span', 'milestone-progress', isTemplate() ? `${milestone.tasks.length} TASK` : makeProgressText(progress({ milestones: [milestone] }))), make('span', 'chevron', '›'));
  button.addEventListener('click', () => {
    if (expanded) state.openMilestones.delete(milestone.id); else state.openMilestones.add(milestone.id);
    renderMap();
  });
  item.append(button);
  if (expanded) {
    const list = make('ul', 'task-list');
    for (const task of milestone.tasks) list.append(taskNode(task, project));
    item.append(list);
  }
  return item;
}

function phaseNode(phase, index, project) {
  const item = make('li', 'phase-node');
  const expanded = state.openPhases.has(phase.id);
  const button = make('button', 'phase-head');
  button.type = 'button';
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Thu' : 'Bung'} mốc chính ${phase.title}`);
  const title = make('span', 'phase-title', phase.title);
  title.append(make('small', '', phase.keyword));
  const p = progress(phase);
  button.append(make('span', 'phase-index', String(index + 1).padStart(2, '0')), title, make('span', 'phase-progress', isTemplate() ? `${p.total} TASK` : `${percentage(p)}% · ${makeProgressText(p)}`), make('span', 'chevron', '›'));
  button.addEventListener('click', () => {
    if (expanded) state.openPhases.delete(phase.id); else state.openPhases.add(phase.id);
    renderMap();
  });
  item.append(button);
  if (expanded) {
    const body = make('div', 'phase-body');
    body.append(make('p', 'phase-description', phase.description));
    const milestones = make('ul');
    milestones.style.listStyle = 'none';
    milestones.style.padding = '0';
    milestones.style.margin = '0';
    for (const milestone of phase.milestones) milestones.append(milestoneNode(milestone, project));
    body.append(milestones);
    item.append(body);
  }
  return item;
}

function renderMap() {
  const project = currentProject();
  if (!project) return;
  renderOverview(project);
  const map = $('#map');
  map.replaceChildren();
  if (isTemplate()) map.append(make('p', 'template-note', 'Đây là cấu trúc tham chiếu. Chọn một game để đánh dấu checklist; từng game có milestone và task riêng.'));
  const root = make('div', 'root-node');
  const rootCopy = make('div');
  rootCopy.append(make('small', '', isTemplate() ? 'REUSABLE STRUCTURE' : 'CURRENT PROJECT'), make('strong', '', project.name), make('p', '', isTemplate() ? '6 phase chính · nội dung tùy theo từng game' : project.description));
  root.append(make('span', 'root-glyph', '✳'), rootCopy);
  map.append(root);
  const phases = make('ol', 'phase-list');
  project.phases.forEach((phase, index) => phases.append(phaseNode(phase, index, project)));
  map.append(phases);
}

function renderLessons() {
  const lessons = state.data.lessons || [];
  $('#lesson-count').textContent = `${String(lessons.length).padStart(2, '0')} LESSONS`;
  const list = $('#lessons-list');
  list.replaceChildren();
  if (!lessons.length) {
    const empty = make('div', 'lesson-empty');
    empty.append(make('span', '', '✳'), make('strong', '', 'Chưa có bài học cá nhân nào'), make('p', '', 'Khi bạn gửi kinh nghiệm đầu tiên, nó sẽ xuất hiện ở đây cùng dự án và điều áp dụng cho lần sau.'));
    list.append(empty);
    return;
  }
  for (const lesson of lessons) {
    const card = make('article', 'lesson-card');
    card.append(make('span', 'lesson-type', (lesson.kind || 'LESSON').toUpperCase()), make('h3', '', lesson.title), make('p', '', lesson.summary));
    if (lesson.nextTime) card.append(make('p', '', `Lần sau: ${lesson.nextTime}`));
    const project = state.data.projects.find(item => item.id === lesson.projectId);
    card.append(make('footer', '', `${project ? project.name : lesson.projectId || 'GameDev Hub'} · ${lesson.date || ''}`));
    list.append(card);
  }
}

function renderAll() { renderMap(); renderLessons(); }
function openSyncDialog() { $('#sync-dialog').showModal(); $('#token-input').focus(); }
function updateSyncButton() {
  $('#sync-button').classList.toggle('connected', !!state.token);
  $('#sync-label').textContent = state.token ? 'GitHub đã kết nối' : 'Kết nối GitHub';
}

function githubHeaders() { return { 'Accept': 'application/vnd.github+json', 'Authorization': `Bearer ${state.token}`, 'X-GitHub-Api-Version': '2022-11-28' }; }
async function githubRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...githubHeaders(), ...(options.headers || {}) }, cache: 'no-store' });
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json()).message || ''; } catch (_) { /* response may be empty */ }
    throw new Error(`GitHub ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return response.json();
}
function decodeContent(base64) { return new TextDecoder().decode(Uint8Array.from(atob(base64.replace(/\s/g, '')), char => char.charCodeAt(0))); }
function encodeContent(value) { const bytes = new TextEncoder().encode(value); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); }
function findTask(data, projectId, taskId) {
  const project = data.projects.find(item => item.id === projectId);
  if (!project) return null;
  for (const phase of project.phases) for (const milestone of phase.milestones) {
    const task = milestone.tasks.find(item => item.id === taskId);
    if (task) return task;
  }
  return null;
}
async function saveTask(projectId, taskId, checked) {
  if (state.saving) return;
  state.saving = true;
  renderMap();
  toast('Đang lưu checklist vào GitHub…');
  try {
    const file = await githubRequest(`${GITHUB_CONTENT_URL}?t=${Date.now()}`);
    const latest = JSON.parse(decodeContent(file.content));
    const task = findTask(latest, projectId, taskId);
    if (!task) throw new Error('Task này không còn trong dữ liệu trên GitHub. Hãy tải lại trang.');
    task.done = checked;
    task.checkedAt = checked ? new Date().toISOString() : null;
    latest.updatedAt = new Date().toISOString();
    await githubRequest(GITHUB_CONTENT_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `gamedevhub: ${checked ? 'complete' : 'reopen'} ${taskId}`, content: encodeContent(JSON.stringify(latest, null, 2) + '\n'), sha: file.sha, branch: 'main' }) });
    state.data = latest;
    toast('Đã lưu vào GitHub. Trang công khai sẽ cập nhật sau khi Pages build.');
  } catch (error) {
    toast(`Không lưu được: ${error.message}`, true);
  } finally {
    state.saving = false;
    renderAll();
  }
}

async function connectGithub() {
  const token = $('#token-input').value.trim();
  if (!token) { toast('Hãy nhập token GitHub.', true); return; }
  state.token = token;
  try {
    await githubRequest('https://api.github.com/user');
    await githubRequest(GITHUB_CONTENT_URL);
    $('#token-input').value = '';
    $('#sync-dialog').close();
    updateSyncButton();
    toast('Đã kết nối GitHub. Bạn có thể đánh dấu task.');
  } catch (error) {
    state.token = '';
    updateSyncButton();
    toast(`Kết nối thất bại: ${error.message}`, true);
  }
}

async function copyLessonTemplate() {
  try { await navigator.clipboard.writeText(LESSON_TEMPLATE); toast('Đã sao chép mẫu. Gửi nội dung đó cho tôi để cập nhật web.'); }
  catch (_) { toast('Không sao chép được. Hãy gửi: dự án, kinh nghiệm, tình huống và lần sau sẽ làm gì.', true); }
}

async function init() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    if (!state.data.projects?.length || !state.data.template) throw new Error('Dữ liệu chưa đúng cấu trúc.');
    setupProjectSelect();
    renderAll();
  } catch (error) {
    $('#map').textContent = `Không tải được bản đồ: ${error.message}`;
    $('#lessons-list').textContent = 'Không tải được kinh nghiệm.';
    toast('Không tải được dữ liệu. Hãy thử làm mới trang.', true);
  }
}

$('#project-select').addEventListener('change', event => {
  state.selectedId = event.target.value;
  state.openPhases = new Set(state.selectedId === 'template' ? ['prototype'] : ['prototype', 'production']);
  state.openMilestones = new Set(state.selectedId === 'template' ? ['prototype-loop'] : ['prototype-navigation', 'production-bows']);
  renderMap();
});
$('#expand-all').addEventListener('click', () => { const project = currentProject(); state.openPhases = new Set(project.phases.map(phase => phase.id)); state.openMilestones = new Set(project.phases.flatMap(phase => phase.milestones.map(m => m.id))); renderMap(); });
$('#collapse-all').addEventListener('click', () => { state.openPhases.clear(); state.openMilestones.clear(); renderMap(); });
$('#sync-button').addEventListener('click', openSyncDialog);
$('#connect-button').addEventListener('click', connectGithub);
$('#disconnect-button').addEventListener('click', () => { state.token = ''; $('#token-input').value = ''; $('#sync-dialog').close(); updateSyncButton(); toast('Đã ngắt kết nối GitHub.'); });
$('#copy-lesson-template').addEventListener('click', copyLessonTemplate);
document.querySelectorAll('.section-tabs a').forEach(link => link.addEventListener('click', () => { document.querySelectorAll('.section-tabs a').forEach(item => item.classList.remove('active')); link.classList.add('active'); }));
init();
