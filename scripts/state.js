const cloneDefaultState = () => JSON.parse(JSON.stringify(DEF));
function loadState() {
  try {
    const raw = localStorage.getItem('mi_state');
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : cloneDefaultState();
  } catch {
    try {
      localStorage.removeItem('mi_state');
    } catch {}
    return cloneDefaultState();
  }
}
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
let S = loadState();
Object.keys(DEF).forEach(k => { if (!(k in S)) S[k] = DEF[k] });
if (!S.items) { S.items = { ...DEF.items } }
Object.keys(DEF.items).forEach(k => { if (!(k in S.items)) S.items[k] = DEF.items[k] });
if (!S.tasks) S.tasks = {};
if (!S.alarms) S.alarms = [];
if (!S.dlEntries) S.dlEntries = [];
if (S.hunger === undefined) S.hunger = 100;
if (S.breed === undefined) S.breed = 'orange';
if (S.breed === 'duanmao') S.breed = 'garfield';
if (!S.lastHungerUpdate) S.lastHungerUpdate = Date.now();
S.mPlay = false;

let isResetting = false;
const save = () => {
  if (isResetting) return;
  try {
    localStorage.setItem('mi_state', JSON.stringify(S));
  } catch {
    if (typeof toast === 'function') toast('本地数据暂时无法保存');
  }
};
let saveSoonTmo = null;
function saveSoon() {
  clearTimeout(saveSoonTmo);
  saveSoonTmo = setTimeout(save, 350);
}
window.addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});
