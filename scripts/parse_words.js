const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join('C:', 'Users', 'angel', 'OneDrive', '바탕 화면', '파닉스', 'words.csv');
const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw.split('\n').map(l => l.replace(/\r/g, '').replace(/^\uFEFF/, ''));

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

const header = parseCSVLine(lines[0]);
console.log('Header:', header);

// Extract base words only
const baseWords = [];
const seen = new Set();
for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  const word = (cols[0] || '').trim().toLowerCase();
  const meaning = (cols[2] || '').trim();
  const variant = (cols[3] || '').trim();
  if (!word || variant !== '' || seen.has(word)) continue;
  if (word.length === 1 && word !== 'a' && word !== 'i') continue;
  if (word.includes('.')) continue;
  seen.add(word);
  baseWords.push({ word, meaning });
}
console.log(`Total base words: ${baseWords.length}\n`);

// === Helpers ===
function isVowel(ch) { return 'aeiou'.includes(ch); }
function isConsonant(ch) { return ch && 'bcdfghjklmnpqrstvwxyz'.includes(ch); }

function syllableCount(w) {
  let count = 0; let prev = false;
  for (const ch of w) {
    const v = 'aeiouy'.includes(ch);
    if (v && !prev) count++;
    prev = v;
  }
  if (w.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}

function getDifficulty(w) {
  if (w.length <= 3) return 1;
  if (w.length <= 4) return 2;
  if (w.length <= 5) return 3;
  if (w.length <= 7) return 4;
  return 5;
}

// === Sight words (3 tiers) ===
const sightBasic = new Set(['a','i','the','is','it','in','on','at','to','and','he','she','we','be','do','no','so','of','or','as','if','up','by']);
const sightInter = new Set(['are','was','has','had','can','not','but','you','all','this','that','with','have','from','they','what','when','who','how','her','his','yes','did']);
const sightAdv = new Set(['could','would','should','about','there','where','every','many','some','any','much','very','also','just','only','both','than','into','over','after','again','never','always','often','already','enough','may','might','must','here','now','too','out','off','why','one']);

// === 24-Unit Classification ===
function classifyWord(w) {
  // Sight words first
  if (sightBasic.has(w)) return 22;
  if (sightInter.has(w)) return 23;
  if (sightAdv.has(w)) return 24;

  const len = w.length;
  const sylls = syllableCount(w);

  // 4+ syllable
  if (sylls >= 4) return 21;
  // 3 syllable
  if (sylls === 3) return 20;

  // === 1-syllable words ===
  if (sylls === 1) {
    // CVC short vowel (3 letters: C-V-C)
    if (len === 3 && isConsonant(w[0]) && isVowel(w[1]) && isConsonant(w[2])) {
      if (w[1] === 'a') return 1;
      if (w[1] === 'e') return 2;
      if (w[1] === 'i') return 3;
      if (w[1] === 'o') return 4;
      if (w[1] === 'u') return 5;
    }

    // Digraphs (ch, sh, th, wh, ph)
    const digraphs = ['ch','sh','th','wh','ph'];
    if (digraphs.some(d => w.includes(d))) return 8;

    // Silent-e (VCe)
    if (len >= 4 && w.endsWith('e') && isConsonant(w[len-2])) {
      for (let i = 0; i < len - 2; i++) {
        if (isVowel(w[i]) && isConsonant(w[i+1])) {
          if (w[i] === 'a' || w[i] === 'i') return 9;
          if (w[i] === 'o' || w[i] === 'u' || w[i] === 'e') return 10;
          return 9;
        }
      }
    }

    // Vowel teams
    if (w.includes('ai') || w.includes('ay')) return 11;
    if (w.includes('ea') || w.includes('ee')) return 12;
    if (w.includes('oa')) return 13;
    if (w.includes('oo') || w.includes('ou') || w.includes('oi') || w.includes('ow') || w.includes('ew') || w.includes('aw')) return 14;

    // R-controlled
    if (w.includes('ar')) return 15;
    if (w.includes('er') || w.includes('ir') || w.includes('ur')) return 16;
    if (w.includes('or')) return 17;

    // Initial blends
    const initBlends = ['bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr','sl','sm','sn','sp','st','str','sw','tr','tw','sc','sk','scr','spr','squ'];
    if (initBlends.some(b => w.startsWith(b))) return 6;

    // Final blends
    const finBlends = ['ck','ng','nk','nd','nt','mp','ft','lk','lt','lp','pt','sk','sp','st'];
    if (finBlends.some(b => w.endsWith(b))) return 7;

    // Remaining 1-syllable short words
    if (len <= 4) return 7;
    return 6;
  }

  // === 2-syllable words ===
  if (sylls === 2) {
    // -y ending
    if (/[bcdfghjklmnpqrstvwxyz]y$/.test(w)) return 18;
    // Others
    return 19;
  }

  return 19;
}

// Classify all
const classified = baseWords.map(({ word, meaning }) => ({
  word, meaning,
  unitId: classifyWord(word),
  difficulty: getDifficulty(word)
}));

classified.sort((a, b) => {
  if (a.unitId !== b.unitId) return a.unitId - b.unitId;
  if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
  return a.word.localeCompare(b.word);
});

const result = classified.map((item, i) => ({
  id: i + 1, unitId: item.unitId,
  word: item.word, meaning: item.meaning,
  difficulty: item.difficulty
}));

// Stats
const unitStats = {};
for (const item of result) unitStats[item.unitId] = (unitStats[item.unitId] || 0) + 1;
const sortedUnits = Object.entries(unitStats).sort((a, b) => +a[0] - +b[0]);
console.log('Words per unit:');
for (const [u, count] of sortedUnits) console.log(`  Unit ${u.padStart(2)}: ${count} words`);
console.log(`\nTotal: ${result.length} words`);

// Write words.json
const outPath = path.join(__dirname, '..', 'src', 'data', 'words.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`\nWritten words to: ${outPath}`);

// === units.json (24 units) ===
const unitDefs = [
  { id:1,  name:'Short A (CVC)',       description:'cat, bat, man, hat...',         phonicsFocus:'Short vowel a',          emoji:'🐱' },
  { id:2,  name:'Short E (CVC)',       description:'bed, red, pen, net...',         phonicsFocus:'Short vowel e',          emoji:'🛏️' },
  { id:3,  name:'Short I (CVC)',       description:'pig, sit, pin, dig...',         phonicsFocus:'Short vowel i',          emoji:'🐷' },
  { id:4,  name:'Short O (CVC)',       description:'dog, hot, top, log...',         phonicsFocus:'Short vowel o',          emoji:'🐶' },
  { id:5,  name:'Short U (CVC)',       description:'cup, bug, run, sun...',         phonicsFocus:'Short vowel u',          emoji:'☕' },
  { id:6,  name:'초성 블렌드',          description:'bl-, br-, cl-, dr-, fl-...',    phonicsFocus:'Initial consonant blends',emoji:'🔗' },
  { id:7,  name:'종성 블렌드',          description:'-ck, -ng, -nk, -nd, -nt...',   phonicsFocus:'Final consonant blends', emoji:'🔚' },
  { id:8,  name:'다이그래프',           description:'ch, sh, th, wh, ph',           phonicsFocus:'Consonant digraphs',     emoji:'✌️' },
  { id:9,  name:'Silent-e (a_e, i_e)', description:'cake, bike, name, like...',     phonicsFocus:'Long a_e, i_e',          emoji:'🎂' },
  { id:10, name:'Silent-e (o_e, u_e)', description:'home, cute, bone, use...',      phonicsFocus:'Long o_e, u_e, e_e',     emoji:'🏠' },
  { id:11, name:'이중모음 AI/AY',       description:'rain, day, play, wait...',      phonicsFocus:'ai, ay vowel teams',     emoji:'🌧️' },
  { id:12, name:'이중모음 EA/EE',       description:'eat, sea, bee, tree...',        phonicsFocus:'ea, ee vowel teams',     emoji:'🌊' },
  { id:13, name:'이중모음 OA',          description:'boat, road, coat, goal...',     phonicsFocus:'oa vowel team',          emoji:'⛵' },
  { id:14, name:'이중모음 OO/OU/OI/OW', description:'moon, out, coin, cow...',      phonicsFocus:'oo, ou, oi, ow, ew, aw', emoji:'🌙' },
  { id:15, name:'R-통제 AR',           description:'car, farm, star, park...',      phonicsFocus:'ar',                     emoji:'🚗' },
  { id:16, name:'R-통제 ER/IR/UR',     description:'her, bird, nurse, turn...',     phonicsFocus:'er, ir, ur',             emoji:'🐦' },
  { id:17, name:'R-통제 OR',           description:'for, more, born, short...',     phonicsFocus:'or, ore',                emoji:'🔮' },
  { id:18, name:'2음절 (-y 끝)',        description:'baby, happy, candy...',         phonicsFocus:'-y ending 2-syllable',   emoji:'👶' },
  { id:19, name:'2음절 기타',           description:'water, table, apple...',        phonicsFocus:'Other 2-syllable',       emoji:'📗' },
  { id:20, name:'3음절',               description:'animal, beautiful...',          phonicsFocus:'3-syllable words',       emoji:'📘' },
  { id:21, name:'4음절+',              description:'elementary, examination...',    phonicsFocus:'4+ syllable words',      emoji:'📙' },
  { id:22, name:'사이트워드 기초',       description:'a, I, the, is, it, in...',     phonicsFocus:'Basic sight words',      emoji:'👁️' },
  { id:23, name:'사이트워드 중급',       description:'are, was, have, they...',      phonicsFocus:'Intermediate sight words',emoji:'👀' },
  { id:24, name:'사이트워드 고급',       description:'could, should, enough...',     phonicsFocus:'Advanced sight words',   emoji:'🔍' },
];

const units = unitDefs.map(d => ({ id: d.id, name: d.name, description: d.description, orderNum: d.id, phonicsFocus: d.phonicsFocus, emoji: d.emoji }));
const unitsPath = path.join(__dirname, '..', 'src', 'data', 'units.json');
fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2), 'utf-8');
console.log(`Written ${units.length} units to: ${unitsPath}`);

// === stages.json ===
const stages = [];
let stageId = 1;
for (const [unitIdStr, count] of sortedUnits) {
  const unitId = +unitIdStr;
  const wordsPerStage = unitId <= 5 ? 3 : 4;
  const numStages = Math.ceil(count / wordsPerStage);
  for (let s = 0; s < numStages; s++) {
    const remaining = count - (s * wordsPerStage);
    stages.push({
      id: stageId, unitId,
      name: `Stage ${unitId}-${s + 1}`,
      orderNum: s + 1,
      monsterCount: Math.min(wordsPerStage, remaining),
      requiredStars: s === 0 ? 0 : Math.min(s, 3)
    });
    stageId++;
  }
}
const stagesPath = path.join(__dirname, '..', 'src', 'data', 'stages.json');
fs.writeFileSync(stagesPath, JSON.stringify(stages, null, 2), 'utf-8');
console.log(`Written ${stages.length} stages to: ${stagesPath}`);

// === monsters.json ===
const monsters = [];
let monsterId = 1;
for (const stage of stages) {
  const wordsPerStage = stage.unitId <= 5 ? 3 : 4;
  const stageWords = result.filter(w => w.unitId === stage.unitId)
    .slice((stage.orderNum - 1) * wordsPerStage, (stage.orderNum - 1) * wordsPerStage + stage.monsterCount);

  stageWords.forEach((we, idx) => {
    const mt = `monster_${String(((monsterId - 1) % 80) + 1).padStart(2, '0')}`;
    const hpMap = { 1:80, 2:100, 3:120, 4:140, 5:160 };
    const hintMap = { 1:0.7, 2:0.6, 3:0.5, 4:0.4, 5:0.3 };
    monsters.push({
      id: monsterId, stageId: stage.id, wordId: we.id,
      type: mt, hp: hpMap[we.difficulty]||100,
      hintDropRate: hintMap[we.difficulty]||0.5,
      positionX: 500 + (idx * 500)
    });
    monsterId++;
  });
}
const monstersPath = path.join(__dirname, '..', 'src', 'data', 'monsters.json');
fs.writeFileSync(monstersPath, JSON.stringify(monsters, null, 2), 'utf-8');
console.log(`Written ${monsters.length} monsters to: ${monstersPath}`);

// === Sample output ===
console.log('\n=== Sample words per unit ===');
for (const [u] of sortedUnits) {
  const uid = +u;
  const def = unitDefs.find(d => d.id === uid);
  const ws = result.filter(w => w.unitId === uid);
  console.log(`  Unit ${u.padStart(2)} [${(def?.name||'?').padEnd(22)}] (${String(ws.length).padStart(3)}): ${ws.slice(0,8).map(w=>w.word).join(', ')}`);
}
