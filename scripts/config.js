// ── STATE ──
const DEF = {
  coins: 50, aff: 10, name: '小橘',
  cc: '#C8714A', cb: '#F5DDB8', ci: '#F0A898', ce: '#5B9EE8',
  breed: 'orange',
  size: 'medium',
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

const TOD = [
  { label: '清晨', sub: '今天也要好好过 ·͜·', h0: 6, h1: 10 },
  { label: '上午', sub: '专注当下的每一刻', h0: 10, h1: 12 },
  { label: '正午', sub: '记得休息一会儿哦', h0: 12, h1: 14 },
  { label: '午后', sub: '慵懒的下午，像猫一样', h0: 14, h1: 18 },
  { label: '傍晚', sub: '今天过得怎么样呢', h0: 18, h1: 21 },
  { label: '深夜', sub: '人总是累累的，早点休息', h0: 21, h1: 24 },
  { label: '深夜', sub: '人总是累累的，早点休息', h0: 0, h1: 6 },
];

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

const LEVELS = ['流浪猫', '刚认识', '普通朋友', '亲密伙伴', '家人'];

let sessReward = { 25: 10, 45: 18, 60: 25 };

const tracks = [
  { name: '雨天的咖啡馆', dur: '3:24', secs: 204, icon: '☕', bg: 'linear-gradient(135deg,#7B6BA0,#4A4268)' },
  { name: '猫咪的午后', dur: '4:12', secs: 252, icon: '🌿', bg: 'linear-gradient(135deg,#5A9E6A,#3A6E4A)' },
  { name: '星空下的漫步', dur: '3:51', secs: 231, icon: '🌙', bg: 'linear-gradient(135deg,#2C3E50,#4CA1AF)' },
  { name: '樱花飘落时', dur: '4:38', secs: 278, icon: '🌸', bg: 'linear-gradient(135deg,#C86080,#804060)' },
  { name: '海浪声声', dur: '5:02', secs: 302, icon: '🌊', bg: 'linear-gradient(135deg,#3A80B0,#1A5080)' },
];

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
