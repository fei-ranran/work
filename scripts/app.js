// ── ONBOARDING ──
let appInited = false;
function initOnboarding() {
  if (!S.firstRun) {
    document.getElementById('ob').style.display = 'none';
    document.getElementById('s-home').classList.add('on');
    document.getElementById('nb-home').classList.add('on');
    initApp();
    return;
  }
  document.getElementById('s-home').classList.remove('on');
  genRain();
  const lines = ['ob0', 'ob1', 'ob2', 'ob3', 'ob4'];
  lines.forEach((id, i) => {
    setTimeout(() => {
      document.getElementById(id).classList.add('show');
      if (i === 3) {
        setTimeout(() => {
          const cat = document.getElementById('ob-cat');
          cat.style.animation = 'ob-appear .9s var(--ease-out) forwards';
        }, 280);
      }
      if (i === lines.length - 1) {
        setTimeout(() => { document.getElementById('ob-name-step').classList.add('show') }, 520);
      }
    }, i * 520 + 300);
  });
}

function genRain() {
  const r = document.getElementById('rain');
  for (let i = 0; i < 55; i++) {
    const d = document.createElement('div');
    d.className = 'raindrop';
    const dur = (0.6 + Math.random() * 0.9).toFixed(2);
    const h = 40 + Math.floor(Math.random() * 80);
    d.style.cssText = `left:${Math.random() * 100}%;height:${h}px;animation-duration:${dur}s;animation-delay:${(Math.random() * 1.5).toFixed(2)}s;opacity:${(0.2 + Math.random() * 0.4).toFixed(2)}`;
    r.appendChild(d);
  }
}

function startApp() {
  const n = document.getElementById('ob-name-inp').value.trim() || '小橘';
  S.name = n; S.firstRun = false; save();
  const ob = document.getElementById('ob');
  ob.classList.add('fade');
  setTimeout(() => {
    ob.style.display = 'none';
    document.getElementById('s-home').classList.add('on');
    document.getElementById('nb-home').classList.add('on');
    initApp();
  }, 420);
}

// ── INIT APP ──
function initApp() {
  if (appInited) return;
  appInited = true;
  genStars();
  applyColors();
  applyBreed();
  // 预加载所有品种的互动图片（WebP 仅 ~300KB），确保移动端点击瞬间切换
  ['orange','xianluo','buou','garfield'].forEach(b => {
    preloadImg(`./assets/images/${b}2.webp`);
  });
  applySize();
  setTimeTheme();
  setInterval(setTimeTheme, 60000);
  setInterval(tickClock, 1000);
  setInterval(tickMusicPos, 1000);
  checkLogin();
  renderAllNames();
  renderInventory();
  renderAlarms();
  renderPlaylist();
  const nta = document.getElementById('note-ta');
  if (nta) {
    nta.value = S.notes || '';
    nta.addEventListener('input', () => {
      document.getElementById('note-wc').textContent = nta.value.length + ' 字';
    });
  }
  updateHUD();
  updateDayLog();
  S.timerLeft = S.timerLeft || S.sessMins * 60;
  renderTimer();

  const now = new Date();
  S.calY = now.getFullYear(); S.calM = now.getMonth();
  renderCalendar(); renderTaskList();
  initTaskTimeInputs();

  // 主页待办同步初始化
  document.getElementById('ht-date').textContent = `${now.getMonth() + 1}月${now.getDate()}日`;
  renderHomeTasks();

  // 核心功能优化：任务顺延与饥饿度
  setTimeout(checkTaskCarryOver, 1500);
  updateHunger();
  setInterval(updateHunger, 60000); // 每分钟刷新一次显示
  renderHomeAlarms();
}

function genStars() {
  const sl = document.getElementById('stars-layer');
  for (let i = 0; i < 50; i++) {
    const d = document.createElement('div');
    d.className = 'sd';
    const s = (1 + Math.random() * 2).toFixed(1);
    d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 60}%;width:${s}px;height:${s}px;--dur:${(1.5 + Math.random() * 3).toFixed(1)}s;animation-delay:${(Math.random() * 3).toFixed(1)}s`;
    sl.appendChild(d);
  }
}

// ── TIME THEME ──
function setTimeTheme() {
  const h = new Date().getHours();
  let tod = TOD.find(t => (h >= t.h0 && h < t.h1)) || TOD[0];
  if (h >= 0 && h < 6) tod = TOD[6];
  document.getElementById('time-word').textContent = tod.label;
  document.getElementById('time-sub').textContent = tod.sub;
  if (h >= 22 || h < 6) {
    document.body.classList.add('night');
    document.getElementById('cat-main').classList.add('is-sleeping');
  }
  else {
    document.body.classList.remove('night');
    document.getElementById('cat-main').classList.remove('is-sleeping');
  }
  updateBubble();
}

// ── SPEECH BUBBLE ──
function updateBubble() {
  const level = getLevel();
  const voice = S.voice || 'cute';
  const arr = bubbles[voice][level];
  const el = document.getElementById('speech-bub');
  if (!el) return;
  el.textContent = arr[Math.floor(Math.random() * arr.length)];
  el.style.animation = 'none';
  requestAnimationFrame(() => el.style.animation = 'bub-in .4s cubic-bezier(.34,1.56,.64,1)');
}

// ── AFFECTION ──

function getLevel() { return Math.min(4, Math.floor(S.aff / 20)) }
function updateHUD() {
  document.getElementById('coin-display').textContent = S.coins;
  document.getElementById('shop-coins').textContent = S.coins;
  if (document.getElementById('i-aff')) document.getElementById('i-aff').textContent = S.aff;
  renderHearts();
  renderInventory();
}
function renderHearts() {
  const cont = document.getElementById('aff-hearts');
  if (!cont) return;
  cont.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const span = document.createElement('span');
    span.className = 'ah' + (i < Math.floor(S.aff / 20) ? ' lit' : '');
    span.textContent = i < Math.floor(S.aff / 20) ? '❤️' : (i < Math.ceil(S.aff / 20) ? '🧡' : '🤍');
    cont.appendChild(span);
  }
  document.getElementById('aff-pct').textContent = S.aff + '%';
  document.getElementById('aff-badge').textContent = LEVELS[getLevel()];
}
function addAff(n, persist = true) {
  const prev = getLevel();
  S.aff = Math.min(100, S.aff + n);
  if (persist) save();
  renderHearts();
  if (getLevel() > prev) {
    toast(`🎉 与${S.name}的关系升级为「${LEVELS[getLevel()]}」！`);
    updateBubble();
  }
}

// ── DAILY LOGIN ──
function checkLogin() {
  const today = new Date().toDateString();
  if (S.lastDate !== today) {
    const bonus = 10 + (S.streak || 0) * 2;
    S.coins += bonus;
    S.streak = S.lastDate && (new Date() - new Date(S.lastDate)) < 172800000 ? (S.streak + 1) : 1;
    S.lastDate = today;
    save(); updateHUD();
    setTimeout(() => toast(`🌅 每日签到 +${bonus} 代币（连续${S.streak}天）`), 2000);
  }
}

// ── CAT INTERACTIONS ──
// 预加载容器，确保切换图片瞬间可用
const preloadCache = {};
function preloadImg(src) {
  if (!preloadCache[src]) {
    preloadCache[src] = new Image();
    preloadCache[src].src = src;
  }
}

function tapCatHome() {
  addAff(1, false);
  spawnParticles('home-particles', '✨💕🐾🌟💖');
  const c = document.getElementById('cat-main');
  if (c) {
    const b = S.breed || 'orange';
    const happy = `./assets/images/${b}2.webp`;
    const normal = `./assets/images/${b}1.webp`;
    preloadImg(happy);
    c.src = happy;
    c.style.animation = 'none';
    void c.offsetHeight;
    c.style.animation = 'happy-jump .5s ease-in-out 2';
    setTimeout(() => {
      c.src = normal;
      c.style.animation = '';
    }, 800);
  }
  saveSoon();
  updateBubble();
}

function petCat() {
  S.petCount++;
  document.getElementById('pet-count').textContent = S.petCount;
  addAff(2, false);
  spawnParticles('pet-particles', '💕💖✨🐾💗');

  const petImg = document.getElementById('cat-pet-img');
  if (petImg) {
    const scales = { small: .72, medium: .85, large: 1 };
    const sc = scales[S.size || 'medium'];
    const b = S.breed || 'orange';
    const happy = `./assets/images/${b}2.webp`;
    const normal = `./assets/images/${b}1.webp`;
    preloadImg(happy);
    petImg.src = happy;
    petImg.style.transform = `scale(${sc * 1.08})`;
    setTimeout(() => {
      petImg.src = normal;
      petImg.style.transform = `scale(${sc})`;
    }, 800);
  }

  saveSoon();
}

function getCatScale() {
  const scales = { small: .72, medium: .85, large: 1 };
  return scales[S.size || 'medium'] || scales.medium;
}

function getEnjoyParticles(mode, type, icon) {
  if (mode === 'feed') {
    const feedIcons = { fish: '🐟', milk: '🥛', treat: '🍬', cake: '🎂' };
    return [icon || feedIcons[type] || '♥', '💕', '✨', '♡', '♥'];
  }

  const playIcons = { ball: '🎾', yarn: '🧶', laser: '🔴', free: '🐾' };
  return [playIcons[type] || '🐾', '💕', '✨', '🐾', '♥'];
}

function spawnEnjoyParticles(layer, mode, type, icon, reduceMotion) {
  if (!layer) return;
  layer.replaceChildren();
  const chars = getEnjoyParticles(mode, type, icon);
  const count = reduceMotion ? 3 : 6;
  const baseX = mode === 'feed' ? 31 : 34;
  const baseY = mode === 'feed' ? 54 : 50;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = `enjoy-particle enjoy-particle-${mode}`;
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = `${baseX + Math.random() * 24}%`;
    el.style.top = `${baseY + Math.random() * 22}%`;
    el.style.setProperty('--tx', `${Math.random() * 84 - 42}px`);
    el.style.setProperty('--ty', `${-(34 + Math.random() * 54)}px`);
    el.style.setProperty('--tr', `${Math.random() * 60 - 30}deg`);
    el.style.animationDelay = `${i * 44}ms`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

function getEnjoyFrames(mode, type, scale) {
  if (mode === 'feed') {
    return [
      { transform: `translateY(0) rotate(0deg) scale(${scale})` },
      { transform: `translateY(5px) rotate(-1deg) scale(${scale * 1.04})`, offset: .34 },
      { transform: `translateY(-4px) rotate(1deg) scale(${scale * 1.08})`, offset: .68 },
      { transform: `translateY(0) rotate(0deg) scale(${scale})` }
    ];
  }

  if (type === 'free') {
    return [
      { transform: `translateX(0) translateY(0) rotate(0deg) scale(${scale})` },
      { transform: `translateX(-5px) translateY(-3px) rotate(-2deg) scale(${scale * 1.05})`, offset: .35 },
      { transform: `translateX(5px) translateY(-2px) rotate(2deg) scale(${scale * 1.05})`, offset: .7 },
      { transform: `translateX(0) translateY(0) rotate(0deg) scale(${scale})` }
    ];
  }

  return [
    { transform: `translateY(0) rotate(0deg) scale(${scale})` },
    { transform: `translateY(-10px) rotate(-2deg) scale(${scale * 1.08})`, offset: .38 },
    { transform: `translateY(-2px) rotate(2deg) scale(${scale * 1.03})`, offset: .72 },
    { transform: `translateY(0) rotate(0deg) scale(${scale})` }
  ];
}

function triggerCatEnjoy(mode, type, icon) {
  const isFeed = mode === 'feed';
  const stage = document.querySelector(isFeed ? '#ip-feed .interaction-cat-stage' : '#ip-play .interaction-cat-stage');
  const img = document.getElementById(isFeed ? 'cat-feed-img' : 'cat-play-img');
  const layer = document.getElementById(isFeed ? 'feed-enjoy-effects' : 'play-enjoy-effects');
  if (!stage || !img || !layer) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scale = getCatScale();
  const breed = S.breed || 'orange';
  const happy = `./assets/images/${breed}2.webp`;
  const normal = `./assets/images/${breed}1.webp`;

  clearTimeout(stage._enjoyTimer);
  img.getAnimations?.().forEach(animation => animation.cancel());
  stage.classList.remove('is-enjoying', 'is-feed-enjoy', 'is-play-enjoy');
  void stage.offsetWidth;
  stage.classList.add('is-enjoying', isFeed ? 'is-feed-enjoy' : 'is-play-enjoy');

  preloadImg(happy);
  img.src = happy;
  img.style.transform = `scale(${scale})`;

  if (!reduceMotion && img.animate) {
    img.animate(getEnjoyFrames(mode, type, scale), {
      duration: isFeed ? 760 : 820,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
    });
  }

  spawnEnjoyParticles(layer, mode, type, icon, reduceMotion);

  stage._enjoyTimer = setTimeout(() => {
    img.src = normal;
    img.style.transform = `scale(${scale})`;
    stage.classList.remove('is-enjoying', 'is-feed-enjoy', 'is-play-enjoy');
    layer.replaceChildren();
  }, reduceMotion ? 430 : 940);
}

function feed(type) {
  const cfg = {
    fish: { aff: 5, name: '小鱼干', icon: '🐟' },
    milk: { aff: 3, name: '猫用牛奶', icon: '🥛' },
    treat: { aff: 4, name: '猫咪零食', icon: '🍬' },
    cake: { aff: 10, name: '生日蛋糕', icon: '🎂' }
  };
  const c = cfg[type];
  if (!c) return;
  if ((S.items[type] || 0) <= 0) { toast('❌ 库存不足，快去商店购买吧'); return; }
  S.items[type] = (S.items[type] || 0) - 1;
  // 喂食增加饥饿度
  S.hunger = Math.min(100, S.hunger + 25);
  updateHunger();

  addAff(c.aff);
  updateHUD(); save();
  triggerCatEnjoy('feed', type, c.icon);
  toast(`${c.icon} ${c.name}已喂给${S.name || '猫咪'} · 库存 -1`);
  updateBubble();
}

function play(type) {
  const cfg = { ball: { need: 'ball', aff: 4, name: '网球' }, yarn: { need: 'yarn', aff: 3, name: '毛线球' }, laser: { need: 'laser', aff: 6, name: '激光笔' }, free: { need: null, aff: 1, name: '徒手逗猫' } };
  const c = cfg[type];
  if (c.need && S.items[c.need] <= 0) { toast('❌ 没有这个玩具了，去商店补充吧'); return; }
  if (c.need) S.items[c.need]--;
  addAff(c.aff);
  updateHUD(); save();
  triggerCatEnjoy('play', type);
  toast(`玩耍中～好感 +${c.aff}♥`);
}

// ── PARTICLES ──
function spawnParticles(id, chars) {
  const cont = document.getElementById(id);
  if (!cont) return;
  const arr = [...chars];
  while (cont.children.length > 18) cont.firstElementChild.remove();
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.textContent = arr[Math.floor(Math.random() * arr.length)];
      el.style.cssText = `left:${15 + Math.random() * 70}%;top:${15 + Math.random() * 70}%;--tx:${Math.random() * 80 - 40}px;--ty:${-(30 + Math.random() * 50)}px;--tr:${Math.random() * 60 - 30}deg`;
      cont.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * 70);
  }
}

// ── SHOP ──
function buy(key, cost, qty, invKey) {
  if (S.coins < cost) { toast(`❌ 代币不足，需要 ${cost} 代币`); return; }
  S.coins -= cost;
  S.items[invKey] = (S.items[invKey] || 0) + qty;
  updateHUD(); save();
  toast(`✅ 购买成功！获得 ${qty} 个`);
}

function renderInventory() {
  const keys = ['fish', 'milk', 'treat', 'cake', 'ball', 'yarn', 'laser', 'bow', 'crown', 'bed'];
  keys.forEach(k => {
    const feed = document.getElementById('fst-' + k);
    const play = document.getElementById('pst-' + k);
    const shop = document.getElementById('si-' + k);
    const v = S.items[k] || 0;
    if (feed) {
      feed.textContent = '库存 ' + v;
      feed.classList.toggle('is-empty', v <= 0);
    }
    if (play) {
      play.textContent = '库存 ' + v;
      play.classList.toggle('is-empty', v <= 0);
    }
    if (shop) shop.textContent = v;
  });
}

// ── READING TIMER ──
let timerInterval = null;

function getSessionReward(mins) {
  return sessReward[mins] || Math.max(1, Math.floor(mins * 0.4));
}
function setSess(mins, btn) {
  mins = Math.max(1, Math.min(180, Number(mins) || 25));
  if (btn) {
    const inp = document.getElementById('custom-sess-inp');
    if (inp) inp.value = '';
  }
  S.sessMins = mins; S.timerLeft = mins * 60; S.timerOn = false;
  clearInterval(timerInterval);
  document.querySelectorAll('.sess').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  const r = getSessionReward(mins);
  document.getElementById('timer-note').innerHTML = `完成后获得 <span class="coin-icon coin-icon-sm" aria-hidden="true">🪙</span> ${r} 代币`;
  document.getElementById('timer-btn').textContent = '开始';
  renderTimer();
}
function renderTimer() {
  const left = S.timerLeft || S.sessMins * 60;
  const m = Math.floor(left / 60), s = left % 60;
  const el = document.getElementById('timer-display');
  if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function toggleTimer() {
  if (!S.timerOn) {
    if (!S.timerLeft || S.timerLeft === 0) S.timerLeft = S.sessMins * 60;
    S.timerOn = true;
    document.getElementById('timer-btn').textContent = '暂停';
    timerInterval = setInterval(() => {
      S.timerLeft--;
      renderTimer();
      if (S.timerLeft <= 0) {
        clearInterval(timerInterval);
        S.timerOn = false;
        S.timerLeft = S.sessMins * 60;
        const rwd = getSessionReward(S.sessMins);
        S.coins += rwd; addAff(3); updateHUD(); save();
        toast(`🎉 阅读完成！+${rwd} 代币 · 好感+3`);
        document.getElementById('timer-btn').textContent = '开始';
        renderTimer();
      }
    }, 1000);
  } else {
    S.timerOn = false;
    clearInterval(timerInterval);
    document.getElementById('timer-btn').textContent = '继续';
  }
  save();
}
function resetTimer() {
  clearInterval(timerInterval); S.timerOn = false; S.timerLeft = S.sessMins * 60;
  document.getElementById('timer-btn').textContent = '开始';
  renderTimer();
}

// ── MUSIC ──
let musicInterval = null;
function renderPlaylist() {
  const pl = document.getElementById('playlist');
  if (!pl) return;
  pl.innerHTML = '';
  tracks.forEach((t, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'pl-item' + (i === S.mTrack ? ' on' : '');
    d.dataset.action = 'select-track';
    d.dataset.track = String(i);
    d.setAttribute('aria-pressed', i === S.mTrack ? 'true' : 'false');
    d.innerHTML = `<div class="pl-n">${i + 1}</div><div class="pl-inf"><div class="pl-t">${t.name}</div><div class="pl-d">${t.dur}</div></div><div class="pl-ic">${i === S.mTrack && S.mPlay ? '🎵' : '♪'}</div>`;
    pl.appendChild(d);
  });
}
function selectTrack(i, resetPosition = true) {
  i = Math.max(0, Math.min(tracks.length - 1, Number(i) || 0));
  S.mTrack = i;
  if (resetPosition) S.mPos = 0;
  const t = tracks[i];
  document.getElementById('m-track').textContent = t.name;
  document.getElementById('m-art').textContent = t.icon;
  document.getElementById('m-art').style.background = t.bg;
  document.getElementById('m-tot').textContent = t.dur;
  renderPlaylist(); updateMusicUI();
}
function toggleMusic() {
  S.mPlay = !S.mPlay;
  if (S.mPlay) {
    musicInterval = setInterval(() => {
      S.mPos++;
      if (S.mPos >= tracks[S.mTrack].secs) { S.mPos = 0; nextTrack(); }
      updateMusicUI();
    }, 1000);
  } else { clearInterval(musicInterval); }
  document.getElementById('m-playbtn').textContent = S.mPlay ? '⏸' : '▶';
  renderPlaylist();
}
function tickMusicPos() { updateMusicUI(); }
function updateMusicUI() {
  const t = tracks[S.mTrack];
  const pct = t.secs > 0 ? (S.mPos / t.secs * 100) : 0;
  const mf = document.getElementById('m-fill');
  if (mf) mf.style.width = pct.toFixed(1) + '%';
  const mc = document.getElementById('m-cur');
  if (mc) { const m = Math.floor(S.mPos / 60), s = S.mPos % 60; mc.textContent = `${m}:${String(s).padStart(2, '0')}`; }
}
function nextTrack() { S.mTrack = (S.mTrack + 1) % tracks.length; selectTrack(S.mTrack); }
function prevTrack() { S.mTrack = (S.mTrack - 1 + tracks.length) % tracks.length; selectTrack(S.mTrack); }
function seekMusic(e, target) {
  const el = target || e.currentTarget;
  const r = el.getBoundingClientRect();
  const clientX = e.clientX || (r.left + r.width / 2);
  S.mPos = Math.floor((clientX - r.left) / r.width * tracks[S.mTrack].secs);
  S.mPos = Math.max(0, Math.min(tracks[S.mTrack].secs, S.mPos));
  updateMusicUI();
}

// ── CLOCK ──
function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('clock-now');
  if (el) el.textContent = `${h}:${m}`;
  S.alarms.forEach(a => {
    if (a.on && a.time === `${h}:${m}` && s === '00') {
      toast(`⏰ ${a.lbl || '提醒时间到了'}！— 来自${S.name}的提醒`);
      S.coins += 5; updateHUD(); save();
    }
  });
}

// ── ALARM ──
function getCurrentTimeValue() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function resetAlarmInputs() {
  const time = document.getElementById('alarm-time');
  const label = document.getElementById('alarm-lbl');
  if (time) time.value = getCurrentTimeValue();
  if (label) label.value = '';
}

function addAlarm() {
  const timeInput = document.getElementById('alarm-time');
  const labelInput = document.getElementById('alarm-lbl');
  const t = timeInput ? timeInput.value : '';
  const l = labelInput && labelInput.value ? labelInput.value : '提醒';
  if (!t) return;
  S.alarms.push({ time: t, lbl: l, on: true, id: Date.now() });
  save(); renderAlarms(); renderHomeAlarms();
  resetAlarmInputs();
  toast('✅ 闹钟已添加');
}
function renderAlarms() {
  const list = document.getElementById('alarm-list');
  if (!list) return;
  list.textContent = '';
  S.alarms.forEach((a, i) => {
    const d = document.createElement('div');
    d.className = 'alarm-item';

    const left = document.createElement('div');
    const time = document.createElement('div');
    time.className = 'ai-time';
    time.textContent = a.time;
    const label = document.createElement('div');
    label.className = 'ai-label';
    label.textContent = a.lbl;
    left.append(time, label);

    const right = document.createElement('div');
    right.className = 'ai-right';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle' + (a.on ? ' on' : '');
    toggle.setAttribute('aria-label', a.on ? '关闭闹钟' : '开启闹钟');
    toggle.setAttribute('aria-pressed', a.on ? 'true' : 'false');
    toggle.dataset.action = 'toggle-alarm';
    toggle.dataset.index = String(i);
    const del = document.createElement('button');
    del.className = 'ai-del';
    del.type = 'button';
    del.textContent = '✕';
    del.dataset.action = 'delete-alarm';
    del.dataset.index = String(i);
    right.append(toggle, del);

    d.append(left, right);
    list.appendChild(d);
  });
}
function toggleAlarm(i) {
  if (!S.alarms[i]) return;
  S.alarms[i].on = !S.alarms[i].on;
  save(); renderAlarms(); renderHomeAlarms();
}
function delAlarm(i) {
  if (!S.alarms[i]) return;
  S.alarms.splice(i, 1);
  save(); renderAlarms(); renderHomeAlarms();
}

function renderHomeAlarms() {
  const wrap = document.getElementById('home-alarm-wrap');
  const card = document.getElementById('home-alarm-card');
  const primary = document.getElementById('home-alarm-primary');
  const sub = document.getElementById('home-alarm-sub');
  const action = document.getElementById('home-alarm-action');
  if (!wrap || !card || !primary || !sub || !action) return;

  wrap.style.display = 'flex';
  const alarms = Array.isArray(S.alarms) ? S.alarms : [];
  const activeAlarms = alarms.filter(a => a.on && a.time).sort((a, b) => a.time.localeCompare(b.time));

  if (!activeAlarms.length) {
    primary.textContent = alarms.length ? '还没有开启的闹钟' : '今日还没有闹钟';
    sub.textContent = alarms.length ? '打开闹钟后会显示在首页' : '让猫咪提醒你重要时刻';
    action.textContent = alarms.length ? '编辑' : '设置';
    card.setAttribute('aria-label', `${action.textContent}闹钟`);
    return;
  }

  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextAlarm = activeAlarms.find(a => a.time >= nowTime) || activeAlarms[0];
  const dayText = nextAlarm.time >= nowTime ? '今天' : '明天';
  const label = nextAlarm.lbl || '提醒';

  primary.textContent = nextAlarm.time;
  sub.textContent = activeAlarms.length > 1
    ? `${dayText} ${label} · 还有 ${activeAlarms.length - 1} 个提醒`
    : `${dayText} ${label}`;
  action.textContent = '编辑';
  card.setAttribute('aria-label', `编辑闹钟，下一次提醒 ${nextAlarm.time} ${label}`);
}

// ── CALENDAR & TASKS ──

let selectedDate = '';
function renderCalendar() {
  const lbl = document.getElementById('cal-lbl');
  if (lbl) lbl.textContent = `${S.calY}年${MONTHS[S.calM]}`;
  const cont = document.getElementById('cal-days');
  if (!cont) return;
  cont.innerHTML = '';
  const first = new Date(S.calY, S.calM, 1).getDay();
  const days = new Date(S.calY, S.calM + 1, 0).getDate();
  const prev = new Date(S.calY, S.calM, 0).getDate();
  const now = new Date();
  for (let i = 0; i < first; i++) {
    const d = document.createElement('div');
    d.className = 'cal-d other'; d.textContent = prev - first + 1 + i; cont.appendChild(d);
  }
  for (let i = 1; i <= days; i++) {
    const d = document.createElement('button');
    d.type = 'button';
    const key = `${S.calY}-${String(S.calM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = i === now.getDate() && S.calM === now.getMonth() && S.calY === now.getFullYear();
    const hasTasks = S.tasks[key] && S.tasks[key].length > 0;
    d.className = 'cal-d' + (isToday ? ' today' : '') + (hasTasks ? ' dot' : '') + (selectedDate === key ? ' selected' : '');
    d.dataset.action = 'select-date';
    d.dataset.date = key;
    d.dataset.day = String(i);
    d.setAttribute('aria-label', `${S.calM + 1}月${i}日`);
    d.textContent = i;
    cont.appendChild(d);
  }
}
function selectDate(key, day) {
  selectedDate = key;
  const inp = document.getElementById('task-inp');
  if (inp) inp.placeholder = `${S.calM + 1}月${day}日的计划…`;
  renderCalendar();
  renderTaskList();
}
function calNav(dir) {
  S.calM += dir;
  if (S.calM > 11) { S.calM = 0; S.calY++; }
  if (S.calM < 0) { S.calM = 11; S.calY--; }
  save(); renderCalendar();
}

// 日历弹窗内添加
function addTask() {
  const inp = document.getElementById('task-inp');
  const timeInp = document.getElementById('task-time');
  const txt = inp.value.trim(); if (!txt) return;
  const time = timeInp ? timeInp.value : '';
  const key = selectedDate || getLocalDateKey();
  if (!S.tasks[key]) S.tasks[key] = [];
  S.tasks[key].push({ txt, time, done: false, id: Date.now() });
  inp.value = '';
  if (timeInp) {
    timeInp.value = '';
    syncTaskTimeLabel(timeInp);
  }
  S.coins += 1; updateHUD(); save();
  renderTaskList(); renderCalendar(); renderHomeTasks();
  toast('✅ 任务已添加 +1 代币');
}

// 主页添加今日任务
function addHomeTask() {
  const inp = document.getElementById('home-task-inp');
  const timeInp = document.getElementById('home-task-time');
  const txt = inp.value.trim();
  if (!txt) return;
  const time = timeInp ? timeInp.value : '';
  const key = getLocalDateKey();
  if (!S.tasks[key]) S.tasks[key] = [];
  S.tasks[key].push({ txt, time, done: false, id: Date.now() });
  inp.value = '';
  if (timeInp) {
    timeInp.value = '';
    syncTaskTimeLabel(timeInp);
  }
  S.coins += 1;
  updateHUD(); save();
  toast('✅ 任务已添加 +1 代币');
  renderHomeTasks();
  renderTaskList();
  renderCalendar();
}

function syncTaskTimeLabel(input) {
  if (!input || !input.id) return;
  const label = document.querySelector(`[data-time-label-for="${input.id}"]`);
  if (!label) return;
  const field = label.closest('.task-time-field');
  label.textContent = input.value || '时间';
  if (field) field.classList.toggle('has-value', Boolean(input.value));
}

function initTaskTimeInputs() {
  document.querySelectorAll('.task-time-inp').forEach(input => {
    syncTaskTimeLabel(input);
    input.addEventListener('input', () => syncTaskTimeLabel(input));
    input.addEventListener('change', () => syncTaskTimeLabel(input));
  });
}

function getOrderedTaskEntries(tasks) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const at = a.task.time || '';
      const bt = b.task.time || '';
      if (at && bt && at !== bt) return at.localeCompare(bt);
      if (at && !bt) return -1;
      if (!at && bt) return 1;
      return a.index - b.index;
    });
}

// 渲染日历里的任务
function createTaskItem(key, task, index) {
  const d = document.createElement('div');
  d.className = 'task-item';

  const chk = document.createElement('button');
  chk.type = 'button';
  chk.className = 'task-chk' + (task.done ? ' done' : '');
  chk.setAttribute('aria-label', task.done ? '取消完成任务' : '完成任务');
  chk.textContent = task.done ? '✓' : '';
  chk.dataset.action = 'toggle-task';
  chk.dataset.key = key;
  chk.dataset.index = String(index);

  const body = document.createElement('div');
  body.className = 'task-body';

  if (task.time) {
    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = task.time;
    body.appendChild(time);
  }

  const txt = document.createElement('span');
  txt.className = 'task-txt' + (task.done ? ' done' : '');
  txt.textContent = task.txt;
  body.appendChild(txt);

  const del = document.createElement('button');
  del.className = 'task-del-btn';
  del.type = 'button';
  del.textContent = '✕';
  del.dataset.action = 'delete-task';
  del.dataset.key = key;
  del.dataset.index = String(index);

  d.append(chk, body, del);
  return d;
}
function renderTaskList() {
  const list = document.getElementById('task-list');
  if (!list) return;
  list.textContent = '';
  const key = selectedDate || getLocalDateKey();
  const tasks = S.tasks[key] || [];
  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'task-empty';
    empty.textContent = '这一天还没有计划，加一个吧～';
    list.appendChild(empty);
    return;
  }
  getOrderedTaskEntries(tasks).forEach(({ task, index }) => {
    list.appendChild(createTaskItem(key, task, index));
  });
}

// 渲染主页的任务
function renderHomeTasks() {
  const list = document.getElementById('home-task-list');
  if (!list) return;
  const key = getLocalDateKey();
  const tasks = S.tasks[key] || [];

  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'dl-empty home-task-empty';
    empty.textContent = '今天还没有待办事项，添点什么吧～';
    list.textContent = '';
    list.appendChild(empty);
    return;
  }

  list.textContent = '';
  getOrderedTaskEntries(tasks).forEach(({ task, index }) => {
    list.appendChild(createTaskItem(key, task, index));
  });
}

// 勾选/取消任务
function toggleTask(key, i, trigger) {
  if (!S.tasks[key] || !S.tasks[key][i]) return;
  S.tasks[key][i].done = !S.tasks[key][i].done;
  if (S.tasks[key][i].done) {
    S.coins += 2;
    updateHUD();
    toast('✅ 任务完成 +2 代币');
    // 触发完成特效
    const rect = trigger ? trigger.getBoundingClientRect() : null;
    spawnCompletionEffect(rect);

    // 1秒后自动删除完成的任务
    const taskId = S.tasks[key][i].id;
    setTimeout(() => {
      if (!S.tasks[key]) return;
      const idx = S.tasks[key].findIndex(t => t.id === taskId);
      if (idx !== -1 && S.tasks[key][idx].done) {
        delTask(key, idx);
      }
    }, 1000);
  }
  save();
  renderTaskList();
  renderHomeTasks();
}

function spawnCompletionEffect(rect) {
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const chars = '✨💖🌟🐾😺';
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.zIndex = '10000';
    el.style.pointerEvents = 'none';
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200 - 50;
    el.style.setProperty('--tx', tx + 'px');
    el.style.setProperty('--ty', ty + 'px');
    el.style.setProperty('--tr', Math.random() * 360 + 'deg');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

// 删除任务
function delTask(key, i) {
  if (!S.tasks[key] || !S.tasks[key][i]) return;
  S.tasks[key].splice(i, 1);
  save();
  renderTaskList();
  renderCalendar();
  renderHomeTasks();
}

// ── NOTES ──
function saveNote() {
  S.notes = document.getElementById('note-ta').value;
  S.coins += 2; updateHUD(); save();
  toast('💾 已保存 +2 代币');
}

// ── DAY LOG ──

function updateDayLog() {
  const list = document.getElementById('day-log-list');
  if (!list) return;
  list.textContent = '';
}

// ── CUSTOMIZE ──
function applyColors() {
  document.documentElement.style.setProperty('--cat-c', S.cc || '#C8714A');
  document.documentElement.style.setProperty('--cat-b', S.cb || '#F5DDB8');
  document.documentElement.style.setProperty('--cat-i', S.ci || '#F0A898');
  document.documentElement.style.setProperty('--cat-e', S.ce || '#5B9EE8');
}
function applyBreed() {
  const b = S.breed || 'orange';
  const mainCat = document.getElementById('cat-main');
  if (mainCat) mainCat.src = `./assets/images/${b}1.webp`;
  const petCat = document.getElementById('cat-pet-img');
  if (petCat) petCat.src = `./assets/images/${b}1.webp`;
  const feedCat = document.getElementById('cat-feed-img');
  if (feedCat) feedCat.src = `./assets/images/${b}1.webp`;
  const playCat = document.getElementById('cat-play-img');
  if (playCat) playCat.src = `./assets/images/${b}1.webp`;
  const previewCat = document.getElementById('cat-preview');
  if (previewCat) previewCat.src = `./assets/images/${b}1.webp`;
  const obCat = document.querySelector('#ob-cat img');
  if (obCat) obCat.src = `./assets/images/${b}1.webp`;

  // 同步高亮显示对应的品种卡片
  document.querySelectorAll('.swatch-wrap').forEach(w => {
    const swatch = w.querySelector('.swatch');
    if (swatch) {
      const swatchBreed = w.getAttribute('data-breed');
      if (swatchBreed === b) {
        swatch.classList.add('on');
      } else {
        swatch.classList.remove('on');
      }
    }
  });
}
function applySize() {
  const scales = { small: .72, medium: .85, large: 1 };
  const sc = scales[S.size || 'medium'];
  document.documentElement.style.setProperty('--cat-sz', sc);

  const pet = document.getElementById('cat-pet-img');
  if (pet) {
    pet.style.transform = `scale(${sc})`;
    pet.style.transformOrigin = 'center bottom';
  }

  const feed = document.getElementById('cat-feed-img');
  if (feed) {
    feed.style.transform = `scale(${sc})`;
    feed.style.transformOrigin = 'center bottom';
  }

  const play = document.getElementById('cat-play-img');
  if (play) {
    play.style.transform = `scale(${sc})`;
    play.style.transformOrigin = 'center bottom';
  }

  const prev = document.getElementById('cat-preview');
  if (prev) {
    prev.style.transform = `scale(${sc})`;
    prev.style.transformOrigin = 'center bottom';
  }
}
function setBreed(b, sw) {
  S.breed = b;
  applyBreed();
  save();
}
function setColor(c, b, inn, _, sw) {
  S.cc = c; S.cb = b; S.ci = inn; applyColors(); save();
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
  sw.querySelector('.swatch').classList.add('on');
}
function setEye(c, sw) {
  S.ce = c; applyColors(); save();
  document.querySelectorAll('.eye-sw').forEach(s => s.classList.remove('on'));
  sw.classList.add('on');
}
function setSize(s, btn) {
  S.size = s; applySize(); save();
  document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}
function setVoice(v, btn) {
  S.voice = v; save();
  document.querySelectorAll('.vc-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  toast('配音风格已更新～'); updateBubble();
}
function saveName() {
  const v = document.getElementById('name-inp').value.trim();
  if (!v) return;
  S.name = v; save(); renderAllNames(); toast('✅ 名字保存成功！');
}
function renderAllNames() {
  ['cat-name-tag', 'i-cat-name'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = S.name; });
  const ni = document.getElementById('name-inp'); if (ni) ni.value = S.name;
}

// ── SCREEN NAV ──
function switchScreen(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.style.display = 'none');

  const sc = document.getElementById('s-' + id);
  if (sc) {
    sc.style.display = 'block';
    sc.classList.add('on');
  }

  // reset all nav buttons
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  if (btn) {
    btn.classList.add('on');
  }
  updateHUD();
  if (id === 'interact') renderInventory();
  if (id === 'shop') renderInventory();
}

// ── TASK CARRY-OVER ──
function checkTaskCarryOver() {
  const today = getLocalDateKey();
  let pendingTasks = [];
  let oldDates = [];

  Object.keys(S.tasks).forEach(date => {
    if (date < today) {
      const uncompleted = S.tasks[date].filter(t => !t.done);
      if (uncompleted.length > 0) {
        pendingTasks.push(...uncompleted);
        oldDates.push(date);
      }
    }
  });

  if (pendingTasks.length > 0) {
    const confirmCarry = confirm(`你还有 ${pendingTasks.length} 个未完成的任务，要移到今天吗？🐾`);
    if (confirmCarry) {
      if (!S.tasks[today]) S.tasks[today] = [];
      S.tasks[today].push(...pendingTasks);
      // 清理旧日期的未完成任务，避免重复弹窗
      oldDates.forEach(date => {
        S.tasks[date] = S.tasks[date].filter(t => t.done);
        if (S.tasks[date].length === 0) delete S.tasks[date];
      });
      save();
      renderHomeTasks();
      renderTaskList();
      renderCalendar();
      toast(`✅ 已同步 ${pendingTasks.length} 个任务至今日`);
    }
  }
}

// ── HUNGER SYSTEM ──
function updateHunger() {
  const now = Date.now();
  const elapsed = now - (S.lastHungerUpdate || now);
  // 每小时下降 5 点
  const drop = (elapsed / (1000 * 60 * 60)) * 5;
  S.hunger = Math.max(0, S.hunger - drop);
  S.lastHungerUpdate = now;

  const bar = document.getElementById('hunger-fill');
  if (bar) bar.style.width = S.hunger + '%';

  const label = document.getElementById('hunger-label');
  if (label) {
    if (S.hunger < 30) label.textContent = '有点饿了... 😿';
    else if (S.hunger < 60) label.textContent = '肚子空空的';
    else label.textContent = '饱饱的 ✨';
  }

  // 根据饥饿度改变猫咪状态
  const catMain = document.getElementById('cat-main');
  if (catMain) {
    catMain.classList.remove('hungry', 'starving');
    if (S.hunger < 30) {
      catMain.classList.add('starving');
    } else if (S.hunger < 60) {
      catMain.classList.add('hungry');
    }
  }
}

// ── MODAL ──
function openModal(name) {
  document.querySelectorAll('.moverlay').forEach(m => m.classList.remove('on'));
  document.getElementById('m-' + name).classList.add('on');
  if (name === 'alarm') {
    tickClock();
    resetAlarmInputs();
  }
  if (name === 'calendar') { renderCalendar(); renderTaskList(); }
  if (name === 'notes') { document.getElementById('note-ta').value = S.notes || ''; }
  if (name === 'music') { renderPlaylist(); selectTrack(S.mTrack, false); }
  renderTimer();
}
function closeModal(name) { document.getElementById('m-' + name).classList.remove('on'); }
function closeModalIfBg(e, name) { if (e.target === e.currentTarget) closeModal(name); }

// ── INTERACT TABS ──
function switchItab(name, btn) {
  document.querySelectorAll('.ipanel').forEach(p => p.classList.remove('on'));
  document.getElementById('ip-' + name).classList.add('on');
  document.querySelectorAll('.itab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

// ── TOAST ──
let toastTmo;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('on');
  clearTimeout(toastTmo);
  toastTmo = setTimeout(() => el.classList.remove('on'), 2800);
}

// ── DEV RESET ──
function devReset() {
  if (!confirm('重置所有数据并返回欢迎界面？')) return;
  isResetting = true;
  S.firstRun = true;
  localStorage.removeItem('mi_state');
  location.reload();
}

// ── DECLARATIVE ACTIONS ──
function runAction(target, event) {
  const action = target.dataset.action;
  switch (action) {
    case 'start-app': startApp(); break;
    case 'tap-cat-home': tapCatHome(); break;
    case 'add-home-task': addHomeTask(); break;
    case 'switch-itab': switchItab(target.dataset.tab, target); break;
    case 'pet-cat': petCat(); break;
    case 'feed': feed(target.dataset.item); break;
    case 'play': play(target.dataset.item); break;
    case 'open-modal': openModal(target.dataset.modal); break;
    case 'close-modal': closeModal(target.dataset.modal); break;
    case 'toast': toast(target.dataset.message || '功能即将到来～'); break;
    case 'buy': buy(target.dataset.item, Number(target.dataset.cost), Number(target.dataset.qty), target.dataset.inv); break;
    case 'set-breed': setBreed(target.dataset.breed, target); break;
    case 'set-size': setSize(target.dataset.size, target); break;
    case 'set-voice': setVoice(target.dataset.voice, target); break;
    case 'save-name': saveName(); break;
    case 'switch-screen': switchScreen(target.dataset.screen, target); break;
    case 'dev-reset': devReset(); break;
    case 'set-session': setSess(Number(target.dataset.mins), target); break;
    case 'reset-timer': resetTimer(); break;
    case 'toggle-timer': toggleTimer(); break;
    case 'select-track': selectTrack(Number(target.dataset.track)); break;
    case 'prev-track': prevTrack(); break;
    case 'toggle-music': toggleMusic(); break;
    case 'next-track': nextTrack(); break;
    case 'seek-music': seekMusic(event, target); break;
    case 'add-alarm': addAlarm(); break;
    case 'toggle-alarm': toggleAlarm(Number(target.dataset.index)); break;
    case 'delete-alarm': delAlarm(Number(target.dataset.index)); break;
    case 'calendar-nav': calNav(Number(target.dataset.dir)); break;
    case 'select-date': selectDate(target.dataset.date, Number(target.dataset.day)); break;
    case 'add-task': addTask(); break;
    case 'toggle-task': toggleTask(target.dataset.key, Number(target.dataset.index), target); break;
    case 'delete-task': delTask(target.dataset.key, Number(target.dataset.index)); break;
    case 'save-note': saveNote(); break;
  }
}

function bindDeclarativeActions() {
  document.addEventListener('click', event => {
    if (event.target.dataset && event.target.dataset.modalOverlay) {
      closeModal(event.target.dataset.modalOverlay);
      return;
    }

    const target = event.target.closest('[data-action]');
    if (!target) return;
    runAction(target, event);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target.closest('[role="button"][data-action]');
    if (!target) return;
    event.preventDefault();
    runAction(target, event);
  });

  document.addEventListener('change', event => {
    const target = event.target.closest('[data-action="set-custom-session"]');
    if (!target) return;
    setSess(parseInt(target.value, 10) || 25, null);
  });
}

function initDebugMode() {
  const params = new URLSearchParams(window.location.search);
  document.body.classList.toggle('debug-mode', params.get('debug') === '1');
}

function syncEdgeOneWatermarkSafeArea() {
  const watermark = document.getElementById('edgeone-watermark');
  const height = watermark ? Math.min(Math.ceil(watermark.getBoundingClientRect().height), 112) : 0;
  document.documentElement.style.setProperty('--bottom-safe', height ? `${height}px` : '0px');
  document.body.classList.toggle('has-edgeone-watermark', height > 0);
}

function watchEdgeOneWatermark() {
  syncEdgeOneWatermarkSafeArea();
  window.addEventListener('resize', syncEdgeOneWatermarkSafeArea);
  const observer = new MutationObserver(syncEdgeOneWatermarkSafeArea);
  observer.observe(document.body, { childList: true, subtree: true });
}

// ── BOOT ──
window.addEventListener('DOMContentLoaded', () => {
  initDebugMode();
  bindDeclarativeActions();
  watchEdgeOneWatermark();
  initOnboarding();
});
