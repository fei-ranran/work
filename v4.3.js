// ── STATE ──
    const DEF = {
      coins: 50, aff: 10, name: '小橘',
      cc: '#C8714A', cb: '#F5DDB8', ci: '#F0A898', ce: '#5B9EE8',
      breed: 'orange',
      size: 'medium', voice: 'cute',
      items: { fish: 3, milk: 2, treat: 0, cake: 0, ball: 1, yarn: 0, laser: 0, bow: 0, crown: 0, bed: 0 },
      petCount: 0, lastDate: '', streak: 0,
      notes: '', alarms: [], tasks: {},
      sessMins: 25, timerLeft: 0, timerOn: false,
      mTrack: 0, mPlay: false, mPos: 0,
      calY: 2025, calM: 0,
      firstRun: true,
      dlEntries: [],
      hunger: 100,
      lastHungerUpdate: Date.now(),
    };
    let S = JSON.parse(localStorage.getItem('mi_state') || 'null') || { ...DEF };
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

    const save = () => { if (!isResetting) localStorage.setItem('mi_state', JSON.stringify(S)); };
    let saveSoonTmo = null;
    function saveSoon() {
      clearTimeout(saveSoonTmo);
      saveSoonTmo = setTimeout(save, 350);
    }
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) save();
    });

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
              cat.style.animation = 'ob-appear 1.5s ease forwards';
            }, 600);
          }
          if (i === lines.length - 1) {
            setTimeout(() => { document.getElementById('ob-name-step').classList.add('show') }, 1000);
          }
        }, i * 900 + 500);
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
      }, 900);
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
        preloadImg(`./image/${b}2.webp`);
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
    const TOD = [
      { label: '清晨', sub: '今天也要好好过 ·͜·', h0: 6, h1: 10 },
      { label: '上午', sub: '专注当下的每一刻', h0: 10, h1: 12 },
      { label: '正午', sub: '记得休息一会儿哦', h0: 12, h1: 14 },
      { label: '午后', sub: '慵懒的下午，像猫一样', h0: 14, h1: 18 },
      { label: '傍晚', sub: '今天过得怎么样呢', h0: 18, h1: 21 },
      { label: '深夜', sub: '人总是累累的，早点休息', h0: 21, h1: 24 },
      { label: '深夜', sub: '人总是累累的，早点休息', h0: 0, h1: 6 },
    ];
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
    const bubbles = {
      cute: {
        0: ['喵……（偷偷打量你）', '叫了一声，又转过头去'],
        1: ['喵。（算是打招呼了）', '你来啦。'],
        2: ['喵～今天天气不错哦', '有什么想做的吗？'],
        3: ['等你好久了！你来啦！', '最近一直在想你呢～'],
        4: ['最喜欢你了！喵！', '有你在，哪里都是家～'],
      },
      cool: {
        0: ['……（冷漠地看了你一眼）', '哼，你谁啊。'],
        1: ['……来了啊。', '也不是很在乎你啦。'],
        2: ['哼，你今天来了啊。', '……算是还行。'],
        3: ['不是说喜欢你……只是习惯了。', '哼，你怎么才来。'],
        4: ['……讨厌啦，别总粘着我。', '（虽然但是，很开心）'],
      },
      baby: {
        0: ['……喵？（歪头）', '你是谁？（好奇地盯着）'],
        1: ['喵喵！', '你来了！'],
        2: ['喵！喵喵！今天也要玩！', '我等你好久了喵～'],
        3: ['你来啦你来啦！！！', '最喜欢你啦！抱抱！'],
        4: ['你是最最最好的！！', '不准走不准走！！'],
      },
      wise: {
        0: ['……（不紧不慢地看着你）', '嗯，你来了。'],
        1: ['今日辛苦了。', '来，坐下歇会儿。'],
        2: ['一起慢慢度过吧。', '人总是累的，没关系。'],
        3: ['岁月很慢，有我在。', '今天也一起过了呢。'],
        4: ['平淡的日子，因你而不同。', '有你在，就很好。'],
      }
    };
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
    const LEVELS = ['流浪猫', '刚认识', '普通朋友', '亲密伙伴', '家人'];
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
        setTimeout(() => toast(`🌅 每日签到 +${bonus}🪙（连续${S.streak}天）`), 2000);
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
        const happy = `./image/${b}2.webp`;
        const normal = `./image/${b}1.webp`;
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
        const happy = `./image/${b}2.webp`;
        const normal = `./image/${b}1.webp`;
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

    function feed(type) {
      const cfg = { fish: { cost: 0, aff: 5, name: '小鱼干' }, milk: { cost: 0, aff: 3, name: '猫用牛奶' }, treat: { cost: 5, aff: 4, name: '猫咪零食' }, cake: { cost: 20, aff: 10, name: '生日蛋糕' } };
      const c = cfg[type];
      if (S.items[type] <= 0) { toast('❌ 库存不足，快去商店购买吧'); return; }
      if (c.cost > 0 && S.coins < c.cost) { toast(`❌ 代币不足，需要 ${c.cost}🪙`); return; }
      S.items[type]--;
      if (c.cost > 0) S.coins -= c.cost;
      // 喂食增加饥饿度
      S.hunger = Math.min(100, S.hunger + 25);
      updateHunger();

      addAff(c.aff);
      updateHUD(); save();
      toast(`${type === 'fish' ? '🐟' : type === 'milk' ? '🥛' : type === 'treat' ? '🍬' : '🎂'} 喂食成功！能量已补充`);
      updateBubble();
    }

    function play(type) {
      const cfg = { ball: { need: 'ball', aff: 4, name: '网球' }, yarn: { need: 'yarn', aff: 3, name: '毛线球' }, laser: { need: 'laser', aff: 6, name: '激光笔' }, free: { need: null, aff: 1, name: '徒手逗猫' } };
      const c = cfg[type];
      if (c.need && S.items[c.need] <= 0) { toast('❌ 没有这个玩具了，去商店补充吧'); return; }
      if (c.need) S.items[c.need]--;
      addAff(c.aff);
      updateHUD(); save();
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
      if (S.coins < cost) { toast(`❌ 代币不足，需要 ${cost}🪙`); return; }
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
        if (feed) feed.textContent = '库存:' + v;
        if (play) play.textContent = '库存:' + v;
        if (shop) shop.textContent = v;
      });
    }

    // ── READING TIMER ──
    let timerInterval = null;
    let sessReward = { 25: 10, 45: 18, 60: 25 };
    function setSess(mins, btn) {
      if (btn) {
        const inp = document.getElementById('custom-sess-inp');
        if (inp) inp.value = '';
      }
      S.sessMins = mins; S.timerLeft = mins * 60; S.timerOn = false;
      clearInterval(timerInterval);
      document.querySelectorAll('.sess').forEach(b => b.classList.remove('on'));
      if (btn) btn.classList.add('on');
      let r = sessReward[mins] || Math.floor(mins * 0.4);
      if (r < 1) r = 1;
      document.getElementById('timer-note').textContent = `完成后获得 🪙 ${r} 代币`;
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
            const rwd = sessReward[S.sessMins] || 10;
            S.coins += rwd; addAff(3); updateHUD(); save();
            toast(`🎉 阅读完成！+${rwd}🪙 · 好感+3`);
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
    const tracks = [
      { name: '雨天的咖啡馆', dur: '3:24', secs: 204, icon: '☕', bg: 'linear-gradient(135deg,#7B6BA0,#4A4268)' },
      { name: '猫咪的午后', dur: '4:12', secs: 252, icon: '🌿', bg: 'linear-gradient(135deg,#5A9E6A,#3A6E4A)' },
      { name: '星空下的漫步', dur: '3:51', secs: 231, icon: '🌙', bg: 'linear-gradient(135deg,#2C3E50,#4CA1AF)' },
      { name: '樱花飘落时', dur: '4:38', secs: 278, icon: '🌸', bg: 'linear-gradient(135deg,#C86080,#804060)' },
      { name: '海浪声声', dur: '5:02', secs: 302, icon: '🌊', bg: 'linear-gradient(135deg,#3A80B0,#1A5080)' },
    ];
    let musicInterval = null;
    function renderPlaylist() {
      const pl = document.getElementById('playlist');
      if (!pl) return;
      pl.innerHTML = '';
      tracks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'pl-item' + (i === S.mTrack ? ' on' : '');
        d.innerHTML = `<div class="pl-n">${i + 1}</div><div class="pl-inf"><div class="pl-t">${t.name}</div><div class="pl-d">${t.dur}</div></div><div class="pl-ic">${i === S.mTrack && S.mPlay ? '🎵' : '♪'}</div>`;
        d.onclick = () => selectTrack(i);
        pl.appendChild(d);
      });
    }
    function selectTrack(i) {
      S.mTrack = i; S.mPos = 0;
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
    function seekMusic(e) { const r = e.currentTarget.getBoundingClientRect(); S.mPos = Math.floor((e.clientX - r.left) / r.width * tracks[S.mTrack].secs); }

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
          toast(`⏰ ${a.lbl || '该起床了'}！— 来自${S.name}的叫醒`);
          S.coins += 5; updateHUD(); save();
        }
      });
    }

    // ── ALARM ──
    function addAlarm() {
      const t = document.getElementById('alarm-time').value;
      const l = document.getElementById('alarm-lbl').value || '起床啦';
      if (!t) return;
      S.alarms.push({ time: t, lbl: l, on: true, id: Date.now() });
      save(); renderAlarms(); renderHomeAlarms();
      toast('✅ 闹钟已添加');
    }
    function renderAlarms() {
      const list = document.getElementById('alarm-list');
      if (!list) return;
      list.innerHTML = '';
      S.alarms.forEach((a, i) => {
        const d = document.createElement('div');
        d.className = 'alarm-item';
        d.innerHTML = `<div><div class="ai-time">${a.time}</div><div class="ai-label">${a.lbl}</div></div>
    <div class="ai-right">
      <div class="toggle ${a.on ? 'on' : ''}" onclick="toggleAlarm(${i})"></div>
      <button class="ai-del" onclick="delAlarm(${i})">✕</button>
    </div>`;
        list.appendChild(d);
      });
    }
    function toggleAlarm(i) { S.alarms[i].on = !S.alarms[i].on; save(); renderAlarms(); renderHomeAlarms(); }
    function delAlarm(i) { S.alarms.splice(i, 1); save(); renderAlarms(); renderHomeAlarms(); }

    function renderHomeAlarms() {
      const wrap = document.getElementById('home-alarm-wrap');
      const listCont = document.getElementById('home-alarm-list');
      if (!wrap || !listCont) return;

      const activeAlarms = S.alarms.filter(a => a.on).sort((a, b) => a.time.localeCompare(b.time));

      if (activeAlarms.length > 0) {
        wrap.style.display = 'flex';
        listCont.innerHTML = activeAlarms.map(a => `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(74, 66, 104, 0.05); padding: 8px 12px; border-radius: 12px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--brown2);">${a.lbl || '提醒'}</span>
        <span style="font-family: 'ZCOOL KuaiLe', cursive; font-size: 16px; color: #4A4268;">${a.time}</span>
      </div>
    `).join('');
      } else {
        wrap.style.display = 'none';
      }
    }

    // ── CALENDAR & TASKS ──
    const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
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
        const d = document.createElement('div');
        const key = `${S.calY}-${String(S.calM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = i === now.getDate() && S.calM === now.getMonth() && S.calY === now.getFullYear();
        const hasTasks = S.tasks[key] && S.tasks[key].length > 0;
        d.className = 'cal-d' + (isToday ? ' today' : '') + (hasTasks ? ' dot' : '');
        d.textContent = i;
        d.onclick = () => { selectedDate = key; document.getElementById('task-inp').placeholder = `${S.calM + 1}月${i}日的计划…`; renderTaskList(); };
        cont.appendChild(d);
      }
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
      const txt = inp.value.trim(); if (!txt) return;
      const key = selectedDate || new Date().toISOString().slice(0, 10);
      if (!S.tasks[key]) S.tasks[key] = [];
      S.tasks[key].push({ txt, done: false, id: Date.now() });
      inp.value = '';
      S.coins += 1; updateHUD(); save();
      renderTaskList(); renderCalendar(); renderHomeTasks();
      toast('✅ 任务已添加 +1🪙');
    }

    // 主页添加今日任务
    function addHomeTask() {
      const inp = document.getElementById('home-task-inp');
      const txt = inp.value.trim();
      if (!txt) return;
      const key = new Date().toISOString().slice(0, 10);
      if (!S.tasks[key]) S.tasks[key] = [];
      S.tasks[key].push({ txt, done: false, id: Date.now() });
      inp.value = '';
      S.coins += 1;
      updateHUD(); save();
      toast('✅ 任务已添加 +1🪙');
      renderHomeTasks();
      renderTaskList();
      renderCalendar();
    }

    // 渲染日历里的任务
    function renderTaskList() {
      const list = document.getElementById('task-list');
      if (!list) return;
      list.innerHTML = '';
      const key = selectedDate || new Date().toISOString().slice(0, 10);
      const tasks = S.tasks[key] || [];
      if (!tasks.length) { list.innerHTML = '<div style="text-align:center;color:var(--brown3);font-size:12px;font-weight:600;padding:12px">这一天还没有计划，加一个吧～</div>'; return; }
      tasks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'task-item';
        d.innerHTML = `<div class="task-chk ${t.done ? 'done' : ''}" onclick="toggleTask('${key}',${i},event)">${t.done ? '✓' : ''}</div>
    <span class="task-txt ${t.done ? 'done' : ''}">${t.txt}</span>
    <button class="task-del-btn" onclick="delTask('${key}',${i})">✕</button>`;
        list.appendChild(d);
      });
    }

    // 渲染主页的任务
    function renderHomeTasks() {
      const list = document.getElementById('home-task-list');
      if (!list) return;
      const key = new Date().toISOString().slice(0, 10);
      const tasks = S.tasks[key] || [];

      if (!tasks.length) {
        list.innerHTML = '<div class="dl-empty" style="padding:10px 0;">今天还没有待办事项，添点什么吧～</div>';
        return;
      }

      list.innerHTML = tasks.map((t, i) => `
    <div class="task-item">
      <div class="task-chk ${t.done ? 'done' : ''}" onclick="toggleTask('${key}',${i},event)">${t.done ? '✓' : ''}</div>
      <span class="task-txt ${t.done ? 'done' : ''}">${t.txt}</span>
      <button class="task-del-btn" onclick="delTask('${key}',${i})">✕</button>
    </div>
  `).join('');
    }

    // 勾选/取消任务
    function toggleTask(key, i, e) {
      S.tasks[key][i].done = !S.tasks[key][i].done;
      if (S.tasks[key][i].done) {
        S.coins += 2;
        updateHUD();
        toast('✅ 任务完成 +2🪙');
        // 触发完成特效
        const rect = e ? e.currentTarget.getBoundingClientRect() : null;
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
      const chars = '✨💖🌟🐾🪙';
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
      toast('💾 已保存 +2🪙');
    }

    // ── DAY LOG ──


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
      if (mainCat) mainCat.src = `./image/${b}1.webp`;
      const petCat = document.getElementById('cat-pet-img');
      if (petCat) petCat.src = `./image/${b}1.webp`;
      const previewCat = document.getElementById('cat-preview');
      if (previewCat) previewCat.src = `./image/${b}1.webp`;
      const obCat = document.querySelector('#ob-cat img');
      if (obCat) obCat.src = `./image/${b}1.webp`;

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
      document.getElementById('nb-center').classList.remove('ctr-on');
      // highlight the right one
      if (id === 'feat') {
        document.getElementById('nb-center').classList.add('ctr-on');
      } else if (btn) {
        btn.classList.add('on');
      }
      updateHUD();
      if (id === 'interact') renderInventory();
      if (id === 'shop') renderInventory();
    }

    // ── TASK CARRY-OVER ──
    function checkTaskCarryOver() {
      const today = new Date().toISOString().slice(0, 10);
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
      if (name === 'alarm') tickClock();
      if (name === 'calendar') { renderCalendar(); renderTaskList(); }
      if (name === 'notes') { document.getElementById('note-ta').value = S.notes || ''; }
      if (name === 'music') { renderPlaylist(); selectTrack(S.mTrack); }
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
    let isResetting = false;
    function devReset() {
      if (!confirm('重置所有数据并返回欢迎界面？')) return;
      isResetting = true;
      S.firstRun = true;
      localStorage.removeItem('mi_state');
      location.reload();
    }

    // ── BOOT ──
    window.addEventListener('DOMContentLoaded', () => {
      initOnboarding();
    });
  
