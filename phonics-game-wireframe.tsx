import { useState } from "react";

const screens = [
  "overview",
  "flow",
  "screen-main",
  "screen-map",
  "screen-game",
  "screen-monster",
  "screen-treasure",
  "screen-forge",
  "screen-inventory",
  "db-schema",
  "db-detail",
  "api"
];

const screenNames = {
  overview: "📋 프로젝트 개요",
  flow: "🔄 게임 플로우",
  "screen-main": "🏠 메인화면",
  "screen-map": "🗺️ 맵 선택",
  "screen-game": "🎮 횡스크롤 게임",
  "screen-monster": "👾 몬스터 퀴즈",
  "screen-treasure": "💎 보물상자",
  "screen-forge": "⚒️ 대장간",
  "screen-inventory": "🎒 인벤토리",
  "db-schema": "🗄️ DB 스키마",
  "db-detail": "📊 DB 상세",
  api: "🔌 API 설계"
};

// --- Wireframe Components ---

const WireBox = ({ x, y, w, h, label, color = "#4A90D9", fontSize = 11, children, dashed, onClick, radius = 6 }) => (
  <g onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
    <rect x={x} y={y} width={w} height={h} rx={radius} fill={color + "22"} stroke={color} strokeWidth={1.5} strokeDasharray={dashed ? "5,3" : "none"} />
    {label && <text x={x + w / 2} y={y + (children ? 16 : h / 2 + 4)} textAnchor="middle" fontSize={fontSize} fill={color} fontWeight="600">{label}</text>}
    {children}
  </g>
);

const Arrow = ({ x1, y1, x2, y2, color = "#666", label }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const ax = x2 - ux * 8, ay = y2 - uy * 8;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} markerEnd="url(#arrowhead)" />
      {label && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize={9} fill={color}>{label}</text>}
    </g>
  );
};

const ArrowDefs = () => (
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#666" />
    </marker>
    <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4A90D9" />
    </marker>
  </defs>
);

// --- Screen Renderers ---

const OverviewScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 16px" }}>📋 프로젝트 개요</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "#f0f7ff", borderRadius: 12, padding: 16, border: "1px solid #d0e3f7" }}>
        <h3 style={{ margin: "0 0 8px", color: "#2c5282" }}>🎯 목표</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#444" }}>
          파닉스 교재 기반 횡스크롤 게임으로 아이들의 영어 학습을 재미있게 유도. 몬스터 퀴즈 → 보물상자 → 보석 획득의 보상 루프를 통해 자연스러운 반복 학습 구현.
        </p>
      </div>
      <div style={{ background: "#f0fff4", borderRadius: 12, padding: 16, border: "1px solid #c6f6d5" }}>
        <h3 style={{ margin: "0 0 8px", color: "#276749" }}>🛠️ 기술 스택</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#444" }}>
          <b>Frontend:</b> React + Phaser.js (게임엔진)<br/>
          <b>Backend:</b> Node.js + Express<br/>
          <b>DB:</b> SQLite (프로토타입) → PostgreSQL<br/>
          <b>음성:</b> Web Speech API (STT)
        </p>
      </div>
      <div style={{ background: "#fffff0", borderRadius: 12, padding: 16, border: "1px solid #fefcbf" }}>
        <h3 style={{ margin: "0 0 8px", color: "#975a16" }}>🎮 핵심 루프</h3>
        <div style={{ fontSize: 13, lineHeight: 2, color: "#444" }}>
          ① 맵 선택 (파닉스 단원)<br/>
          ② 횡스크롤 이동 → 몬스터 조우<br/>
          ③ 몬스터 퀴즈 (음성 답변)<br/>
          ④ 칼 공격 → 힌트 획득 (확률)<br/>
          ⑤ 보물상자 → 스펠링 입력<br/>
          ⑥ 보석 획득 → 대장간 수리
        </div>
      </div>
      <div style={{ background: "#fff5f5", borderRadius: 12, padding: 16, border: "1px solid #fed7d7" }}>
        <h3 style={{ margin: "0 0 8px", color: "#9b2c2c" }}>📚 콘텐츠 구조</h3>
        <div style={{ fontSize: 13, lineHeight: 2, color: "#444" }}>
          <b>Unit 1:</b> A-E 단모음 (cat, bed, pig...)<br/>
          <b>Unit 2:</b> F-J 자음 (fan, hat, jam...)<br/>
          <b>Unit 3:</b> K-O (kit, leg, map...)<br/>
          <b>Unit 4:</b> P-T (pen, sun, top...)<br/>
          <b>Unit 5:</b> U-Z + 복합 (cup, van, zoo...)
        </div>
      </div>
    </div>
  </div>
);

const FlowScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🔄 게임 플로우 다이어그램</h2>
    <svg viewBox="0 0 760 520" style={{ width: "100%", background: "#fafbfc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <ArrowDefs />
      {/* Row 1 */}
      <WireBox x={300} y={15} w={160} h={40} label="🏠 메인 화면" color="#4A90D9" />
      <Arrow x1={380} y1={55} x2={380} y2={80} />
      <WireBox x={270} y={80} w={220} h={40} label="🗺️ 단원(맵) 선택" color="#48BB78" />
      <Arrow x1={380} y1={120} x2={380} y2={150} />
      
      {/* Game Area */}
      <rect x={40} y={150} width={680} height={340} rx={12} fill="#EBF8FF" stroke="#4A90D9" strokeWidth={1} strokeDasharray="6,3" />
      <text x={60} y={172} fontSize={11} fill="#4A90D9" fontWeight="bold">🎮 횡스크롤 게임 영역</text>
      
      <WireBox x={280} y={180} w={200} h={36} label="➡️ 캐릭터 이동 (횡스크롤)" color="#4A90D9" fontSize={10} />
      <Arrow x1={380} y1={216} x2={380} y2={240} />
      
      {/* Monster Encounter */}
      <WireBox x={260} y={240} w={240} h={36} label="👾 몬스터 조우 (퀴즈 출제)" color="#E53E3E" />
      
      {/* Branch: Attack vs Answer */}
      <Arrow x1={260} y1={258} x2={140} y2={300} />
      <Arrow x1={500} y1={258} x2={580} y2={300} />
      
      {/* Left: Attack */}
      <WireBox x={50} y={300} w={180} h={36} label="⚔️ 칼로 공격" color="#D69E2E" />
      <Arrow x1={140} y1={336} x2={80} y2={370} />
      <Arrow x1={140} y1={336} x2={200} y2={370} />
      
      <WireBox x={20} y={370} w={120} h={50} color="#48BB78" fontSize={9}>
        <text x={80} y={392} textAnchor="middle" fontSize={9} fill="#48BB78">✅ 힌트 획득</text>
        <text x={80} y={406} textAnchor="middle" fontSize={8} fill="#888">(랜덤 확률)</text>
      </WireBox>
      <WireBox x={150} y={370} w={120} h={50} color="#E53E3E" fontSize={9}>
        <text x={210} y={392} textAnchor="middle" fontSize={9} fill="#E53E3E">❌ 빗나감</text>
        <text x={210} y={406} textAnchor="middle" fontSize={8} fill="#888">(내구도만 감소)</text>
      </WireBox>
      
      <text x={140} y={445} textAnchor="middle" fontSize={9} fill="#D69E2E" fontWeight="bold">🔧 무기 내구도 감소</text>
      <Arrow x1={140} y1={450} x2={140} y2={472} />
      <WireBox x={65} y={472} w={150} h={28} label="⚒️ 대장간 (잼으로 수리)" color="#D69E2E" fontSize={9} />
      
      {/* Right: Answer */}
      <WireBox x={500} y={300} w={180} h={50} color="#805AD5" fontSize={9}>
        <text x={590} y={322} textAnchor="middle" fontSize={10} fill="#805AD5">🎤 음성으로 단어 답변</text>
        <text x={590} y={338} textAnchor="middle" fontSize={8} fill="#888">(Web Speech API)</text>
      </WireBox>
      
      <Arrow x1={590} y1={350} x2={530} y2={385} />
      <Arrow x1={590} y1={350} x2={650} y2={385} />
      
      <WireBox x={480} y={385} w={100} h={32} label="✅ 정답" color="#48BB78" fontSize={10} />
      <WireBox x={600} y={385} w={100} h={32} label="❌ 오답" color="#E53E3E" fontSize={10} />
      
      <Arrow x1={530} y1={417} x2={530} y2={445} />
      <text x={660} y={430} textAnchor="middle" fontSize={8} fill="#E53E3E">재도전 or 공격</text>
      <Arrow x1={650} y1={417} x2={500} y2={258} color="#E53E3E" />
      
      <WireBox x={440} y={445} w={180} h={36} label="💎 보물상자 (스펠링 입력)" color="#D69E2E" />
      <Arrow x1={620} y1={463} x2={670} y2={463} />
      <WireBox x={630} y={448} w={80} h={30} label="🏆 보석!" color="#48BB78" fontSize={10} />
    </svg>
  </div>
);

const MainScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🏠 메인 화면 와이어프레임</h2>
    <svg viewBox="0 0 375 680" style={{ width: 320, margin: "0 auto", display: "block", background: "#1a1a2e", borderRadius: 24, border: "2px solid #333" }}>
      {/* Status Bar */}
      <rect x={0} y={0} width={375} height={44} fill="#111128" rx={24} />
      <text x={187} y={28} textAnchor="middle" fontSize={12} fill="#fff">9:41</text>
      
      {/* Title */}
      <text x={187} y={100} textAnchor="middle" fontSize={32} fill="#FFD700" fontWeight="bold">✨ Phonics</text>
      <text x={187} y={130} textAnchor="middle" fontSize={28} fill="#fff" fontWeight="bold">Adventure</text>
      
      {/* Character */}
      <circle cx={187} cy={220} r={60} fill="#4A90D933" stroke="#4A90D9" strokeWidth={2} />
      <text x={187} y={225} textAnchor="middle" fontSize={40}>🧙‍♂️</text>
      <text x={187} y={295} textAnchor="middle" fontSize={14} fill="#aaa">Lv.3 | 💎 42개</text>
      
      {/* Buttons */}
      <rect x={50} y={340} width={275} height={56} rx={28} fill="#4A90D9" />
      <text x={187} y={374} textAnchor="middle" fontSize={18} fill="#fff" fontWeight="bold">🎮 게임 시작</text>
      
      <rect x={50} y={416} width={275} height={56} rx={28} fill="#48BB7833" stroke="#48BB78" strokeWidth={1.5} />
      <text x={187} y={450} textAnchor="middle" fontSize={18} fill="#48BB78" fontWeight="bold">🎒 인벤토리</text>
      
      <rect x={50} y={492} width={275} height={56} rx={28} fill="#D69E2E33" stroke="#D69E2E" strokeWidth={1.5} />
      <text x={187} y={526} textAnchor="middle" fontSize={18} fill="#D69E2E" fontWeight="bold">⚒️ 대장간</text>
      
      <rect x={50} y={568} width={275} height={56} rx={28} fill="#805AD533" stroke="#805AD5" strokeWidth={1.5} />
      <text x={187} y={602} textAnchor="middle" fontSize={18} fill="#805AD5" fontWeight="bold">📊 학습 리포트</text>
      
      {/* Bottom Nav */}
      <rect x={0} y={640} width={375} height={40} fill="#111128" rx={0} />
      <text x={94} y={664} textAnchor="middle" fontSize={10} fill="#aaa">🏠 홈</text>
      <text x={187} y={664} textAnchor="middle" fontSize={10} fill="#aaa">📖 단어장</text>
      <text x={281} y={664} textAnchor="middle" fontSize={10} fill="#aaa">⚙️ 설정</text>
    </svg>
  </div>
);

const MapScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🗺️ 맵 선택 (파닉스 단원)</h2>
    <svg viewBox="0 0 760 400" style={{ width: "100%", background: "#0d1117", borderRadius: 12, border: "1px solid #30363d" }}>
      {/* Path */}
      <path d="M 60 350 Q 150 200 250 280 Q 350 360 450 250 Q 550 140 650 200 Q 720 240 730 120" fill="none" stroke="#4A90D944" strokeWidth={40} strokeLinecap="round" />
      <path d="M 60 350 Q 150 200 250 280 Q 350 360 450 250 Q 550 140 650 200 Q 720 240 730 120" fill="none" stroke="#FFD70033" strokeWidth={4} strokeDasharray="8,8" />
      
      {/* Unit Nodes */}
      {[
        { x: 60, y: 350, unit: "Unit 1", name: "A-E 단모음", emoji: "🏰", color: "#48BB78", unlocked: true, stars: 3 },
        { x: 200, y: 260, unit: "Unit 2", name: "F-J 자음", emoji: "🌲", color: "#4A90D9", unlocked: true, stars: 2 },
        { x: 360, y: 310, unit: "Unit 3", name: "K-O", emoji: "🏔️", color: "#D69E2E", unlocked: true, stars: 0 },
        { x: 520, y: 200, unit: "Unit 4", name: "P-T", emoji: "🌋", color: "#805AD5", unlocked: false, stars: 0 },
        { x: 680, y: 160, unit: "Unit 5", name: "U-Z 복합", emoji: "🏯", color: "#E53E3E", unlocked: false, stars: 0 },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={36} fill={n.unlocked ? n.color + "33" : "#333"} stroke={n.unlocked ? n.color : "#555"} strokeWidth={2.5} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={28}>{n.unlocked ? n.emoji : "🔒"}</text>
          <text x={n.x} y={n.y - 44} textAnchor="middle" fontSize={11} fill={n.unlocked ? "#fff" : "#666"} fontWeight="bold">{n.unit}</text>
          <text x={n.x} y={n.y - 30} textAnchor="middle" fontSize={9} fill={n.unlocked ? "#aaa" : "#555"}>{n.name}</text>
          {n.stars > 0 && (
            <text x={n.x} y={n.y + 52} textAnchor="middle" fontSize={12} fill="#FFD700">
              {"⭐".repeat(n.stars)}{"☆".repeat(3 - n.stars)}
            </text>
          )}
        </g>
      ))}
      
      {/* Header */}
      <text x={380} y={40} textAnchor="middle" fontSize={20} fill="#fff" fontWeight="bold">🗺️ 파닉스 월드</text>
      <text x={380} y={60} textAnchor="middle" fontSize={11} fill="#aaa">단원을 선택하여 모험을 시작하세요!</text>
      
      {/* Player indicator */}
      <text x={360} y={290} textAnchor="middle" fontSize={20}>🧙‍♂️</text>
      <text x={360} y={340} textAnchor="middle" fontSize={9} fill="#FFD700">← 현재 위치</text>
    </svg>
  </div>
);

const GameScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🎮 횡스크롤 게임 화면</h2>
    <svg viewBox="0 0 760 420" style={{ width: "100%", background: "#87CEEB", borderRadius: 12, border: "1px solid #5ba3d9" }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F0FF" />
        </linearGradient>
      </defs>
      <rect width={760} height={420} fill="url(#sky)" rx={12} />
      
      {/* Ground */}
      <rect x={0} y={320} width={760} height={100} fill="#5D8233" rx={0} />
      <rect x={0} y={320} width={760} height={8} fill="#7CB342" />
      
      {/* Clouds */}
      <ellipse cx={120} cy={60} rx={50} ry={20} fill="#fff" opacity={0.7} />
      <ellipse cx={400} cy={45} rx={60} ry={25} fill="#fff" opacity={0.6} />
      <ellipse cx={650} cy={70} rx={45} ry={18} fill="#fff" opacity={0.8} />
      
      {/* HUD */}
      <rect x={10} y={10} width={200} height={55} rx={10} fill="#00000088" />
      <text x={25} y={32} fontSize={12} fill="#fff">❤️ ████████░░</text>
      <text x={25} y={52} fontSize={12} fill="#FFD700">💎 42  |  🗡️ 85%  |  🍬 12</text>
      
      <rect x={550} y={10} width={200} height={35} rx={10} fill="#00000088" />
      <text x={650} y={34} textAnchor="middle" fontSize={13} fill="#fff">Unit 1 - Stage 3</text>
      
      {/* Pause button */}
      <rect x={710} y={55} width={40} height={30} rx={8} fill="#00000066" />
      <text x={730} y={76} textAnchor="middle" fontSize={14} fill="#fff">⏸️</text>
      
      {/* Player */}
      <g>
        <text x={160} y={305} textAnchor="middle" fontSize={50}>🧙‍♂️</text>
        <text x={160} y={258} textAnchor="middle" fontSize={8} fill="#333" fontWeight="bold">Player</text>
        <rect x={135} y={262} width={50} height={6} rx={3} fill="#333" />
        <rect x={135} y={262} width={42} height={6} rx={3} fill="#4CAF50" />
      </g>
      
      {/* Monster 1 */}
      <g>
        <text x={380} y={300} textAnchor="middle" fontSize={45}>👾</text>
        <rect x={340} y={250} width={80} height={28} rx={8} fill="#E53E3E" />
        <text x={380} y={269} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="bold">🔊 "cat"?</text>
      </g>
      
      {/* Monster 2 */}
      <g opacity={0.5}>
        <text x={550} y={305} textAnchor="middle" fontSize={40}>🐉</text>
      </g>
      
      {/* Treasure */}
      <g>
        <text x={680} y={305} textAnchor="middle" fontSize={42}>📦</text>
        <text x={680} y={258} textAnchor="middle" fontSize={10} fill="#D69E2E">🔒 보물상자</text>
      </g>
      
      {/* Direction arrow */}
      <text x={460} y={380} textAnchor="middle" fontSize={24} fill="#fff">➡️ ➡️ ➡️</text>
      
      {/* Controls */}
      <rect x={10} y={360} width={160} height={50} rx={12} fill="#00000044" />
      <text x={50} y={392} textAnchor="middle" fontSize={22}>◀️</text>
      <text x={130} y={392} textAnchor="middle" fontSize={22}>▶️</text>
      
      <rect x={590} y={360} width={160} height={50} rx={12} fill="#00000044" />
      <text x={630} y={392} textAnchor="middle" fontSize={22}>⚔️</text>
      <text x={710} y={392} textAnchor="middle" fontSize={22}>🎤</text>
      
      {/* Hint letters floating */}
      <text x={300} y={200} fontSize={16} fill="#FFD70088" fontWeight="bold">c</text>
      <text x={420} y={180} fontSize={16} fill="#FFD70088" fontWeight="bold">a</text>
      <text x={500} y={210} fontSize={16} fill="#FFD70044" fontWeight="bold">?</text>
    </svg>
    <p style={{ fontSize: 11, color: "#888", textAlign: "center", margin: "8px 0 0" }}>
      ← → 이동 | ⚔️ 공격(힌트) | 🎤 음성답변 | 몬스터를 지나 보물상자 도달
    </p>
  </div>
);

const MonsterScreen = () => (
  <div>
    <h2 style={{ color: "#E53E3E", margin: "0 0 12px" }}>👾 몬스터 퀴즈 & 전투 화면</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <svg viewBox="0 0 360 480" style={{ background: "#1a1a2e", borderRadius: 16, border: "1px solid #333" }}>
        <text x={180} y={30} textAnchor="middle" fontSize={13} fill="#E53E3E" fontWeight="bold">퀴즈 모드</text>
        
        {/* Monster */}
        <text x={180} y={140} textAnchor="middle" fontSize={80}>👾</text>
        <rect x={80} y={160} width={200} height={10} rx={5} fill="#333" />
        <rect x={80} y={160} width={140} height={10} rx={5} fill="#E53E3E" />
        <text x={180} y={185} textAnchor="middle" fontSize={10} fill="#aaa">HP: 70%</text>
        
        {/* Speech bubble */}
        <rect x={60} y={200} width={240} height={70} rx={16} fill="#fff" />
        <polygon points="170,270 180,290 190,270" fill="#fff" />
        <text x={180} y={225} textAnchor="middle" fontSize={14} fill="#333">🔊 이 단어를 말해보세요!</text>
        <text x={180} y={250} textAnchor="middle" fontSize={24} fill="#4A90D9" fontWeight="bold">"cat"</text>
        
        {/* Hint letters */}
        <rect x={60} y={300} width={240} height={45} rx={10} fill="#FFD70022" stroke="#FFD700" strokeWidth={1} />
        <text x={180} y={320} textAnchor="middle" fontSize={10} fill="#FFD700">💡 획득한 힌트 철자</text>
        <text x={120} y={338} textAnchor="middle" fontSize={20} fill="#FFD700" fontWeight="bold">c</text>
        <text x={160} y={338} textAnchor="middle" fontSize={20} fill="#FFD700" fontWeight="bold">a</text>
        <text x={200} y={338} textAnchor="middle" fontSize={20} fill="#666">_</text>
        
        {/* Mic button */}
        <circle cx={180} cy={400} r={35} fill="#4A90D9" />
        <text x={180} y={408} textAnchor="middle" fontSize={30}>🎤</text>
        <text x={180} y={450} textAnchor="middle" fontSize={10} fill="#aaa">탭하여 말하기</text>
        
        {/* Attack button */}
        <rect x={60} y={460} width={100} height={0} rx={8} />
      </svg>
      
      <svg viewBox="0 0 360 480" style={{ background: "#1a1a2e", borderRadius: 16, border: "1px solid #333" }}>
        <text x={180} y={30} textAnchor="middle" fontSize={13} fill="#D69E2E" fontWeight="bold">공격 모드 (힌트 획득)</text>
        
        {/* Monster */}
        <text x={180} y={140} textAnchor="middle" fontSize={80}>👾</text>
        
        {/* Attack animation */}
        <text x={120} y={120} fontSize={30}>⚔️</text>
        <text x={100} y={90} fontSize={16} fill="#FFD700">💥</text>
        <text x={230} y={100} fontSize={16} fill="#FFD700">✨</text>
        
        {/* Result panels */}
        <rect x={40} y={200} width={280} height={100} rx={12} fill="#48BB7822" stroke="#48BB78" strokeWidth={1} />
        <text x={180} y={225} textAnchor="middle" fontSize={14} fill="#48BB78" fontWeight="bold">✅ 힌트 획득!</text>
        <text x={180} y={250} textAnchor="middle" fontSize={28} fill="#FFD700" fontWeight="bold">" t "</text>
        <text x={180} y={275} textAnchor="middle" fontSize={10} fill="#aaa">랜덤 확률: 60% 성공</text>
        
        <rect x={40} y={315} width={280} height={70} rx={12} fill="#E53E3E22" stroke="#E53E3E" strokeWidth={1} />
        <text x={180} y={340} textAnchor="middle" fontSize={14} fill="#E53E3E" fontWeight="bold">⚠️ 무기 내구도 감소</text>
        <text x={180} y={365} textAnchor="middle" fontSize={12} fill="#aaa">🗡️ 85% → 75% (-10%)</text>
        
        {/* Durability bar */}
        <rect x={80} y={400} width={200} height={16} rx={8} fill="#333" />
        <rect x={80} y={400} width={150} height={16} rx={8} fill="#D69E2E" />
        <text x={180} y={412} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="bold">75%</text>
        
        <text x={180} y={445} textAnchor="middle" fontSize={10} fill="#D69E2E">⚠️ 30% 이하시 대장간 필요!</text>
      </svg>
    </div>
  </div>
);

const TreasureScreen = () => (
  <div>
    <h2 style={{ color: "#D69E2E", margin: "0 0 12px" }}>💎 보물상자 & 스펠링 입력</h2>
    <svg viewBox="0 0 375 500" style={{ width: 320, margin: "0 auto", display: "block", background: "#1a1a2e", borderRadius: 20, border: "2px solid #D69E2E44" }}>
      {/* Treasure chest */}
      <text x={187} y={100} textAnchor="middle" fontSize={70}>📦</text>
      <text x={187} y={130} textAnchor="middle" fontSize={14} fill="#D69E2E" fontWeight="bold">보물상자를 열려면 스펠링을 입력하세요!</text>
      
      {/* Word prompt */}
      <rect x={50} y={150} width={275} height={60} rx={16} fill="#4A90D922" stroke="#4A90D9" strokeWidth={1} />
      <text x={187} y={175} textAnchor="middle" fontSize={12} fill="#4A90D9">🔊 이 단어의 철자를 입력하세요</text>
      <text x={187} y={200} textAnchor="middle" fontSize={22} fill="#fff" fontWeight="bold">[ cat ]</text>
      
      {/* Spelling input boxes */}
      <g>
        <rect x={100} y={230} width={50} height={55} rx={10} fill="#333" stroke="#4A90D9" strokeWidth={2} />
        <text x={125} y={268} textAnchor="middle" fontSize={28} fill="#4A90D9" fontWeight="bold">c</text>
        
        <rect x={162} y={230} width={50} height={55} rx={10} fill="#333" stroke="#4A90D9" strokeWidth={2} />
        <text x={187} y={268} textAnchor="middle" fontSize={28} fill="#4A90D9" fontWeight="bold">a</text>
        
        <rect x={224} y={230} width={50} height={55} rx={10} fill="#333" stroke="#FFD700" strokeWidth={2.5} />
        <text x={249} y={268} textAnchor="middle" fontSize={28} fill="#666">_</text>
        <rect x={224} y={282} width={50} height={3} rx={1} fill="#FFD700">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>
      
      {/* Hint display */}
      <rect x={60} y={300} width={255} height={35} rx={8} fill="#FFD70011" stroke="#FFD70044" strokeWidth={1} />
      <text x={187} y={322} textAnchor="middle" fontSize={11} fill="#FFD700">💡 힌트: c, a (칼 공격으로 획득한 철자)</text>
      
      {/* Virtual Keyboard */}
      <rect x={15} y={350} width={345} height={140} rx={12} fill="#222" />
      {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, ri) => (
        <g key={ri}>
          {row.split("").map((ch, ci) => (
            <g key={ci}>
              <rect x={20 + ri * 12 + ci * 33} y={360 + ri * 40} width={28} height={32} rx={6} fill="#444" />
              <text x={34 + ri * 12 + ci * 33} y={382 + ri * 40} textAnchor="middle" fontSize={13} fill="#fff">{ch}</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  </div>
);

const ForgeScreen = () => (
  <div>
    <h2 style={{ color: "#D69E2E", margin: "0 0 12px" }}>⚒️ 대장간 화면</h2>
    <svg viewBox="0 0 375 500" style={{ width: 320, margin: "0 auto", display: "block", background: "#1a1a2e", borderRadius: 20, border: "2px solid #D69E2E44" }}>
      <text x={187} y={40} textAnchor="middle" fontSize={18} fill="#D69E2E" fontWeight="bold">⚒️ 대장간</text>
      
      {/* Blacksmith */}
      <text x={187} y={120} textAnchor="middle" fontSize={60}>🧔‍♂️</text>
      <rect x={70} y={135} width={235} height={40} rx={12} fill="#333" />
      <text x={187} y={155} textAnchor="middle" fontSize={12} fill="#fff">"무기를 고쳐드리겠습니다!"</text>
      <text x={187} y={168} textAnchor="middle" fontSize={10} fill="#D69E2E">"잼을 가져오세요~"</text>
      
      {/* Current weapon */}
      <rect x={40} y={190} width={295} height={90} rx={12} fill="#333" stroke="#D69E2E44" strokeWidth={1} />
      <text x={187} y={212} textAnchor="middle" fontSize={12} fill="#aaa">현재 무기</text>
      <text x={80} y={250} textAnchor="middle" fontSize={30}>🗡️</text>
      <text x={200} y={238} textAnchor="middle" fontSize={14} fill="#fff" fontWeight="bold">용사의 검</text>
      <rect x={140} y={248} width={140} height={10} rx={5} fill="#333" />
      <rect x={140} y={248} width={42} height={10} rx={5} fill="#E53E3E" />
      <text x={300} y={258} fontSize={10} fill="#E53E3E">30%</text>
      <text x={200} y={272} textAnchor="middle" fontSize={9} fill="#E53E3E">⚠️ 수리가 필요합니다!</text>
      
      {/* Repair options */}
      <text x={187} y={305} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">수리 옵션</text>
      
      {[
        { y: 315, name: "일반 수리", cost: "🍬 5개", restore: "+30%", color: "#48BB78" },
        { y: 370, name: "완전 수리", cost: "🍬 15개", restore: "+100%", color: "#4A90D9" },
        { y: 425, name: "강화 수리", cost: "🍬 30 + 💎 5", restore: "+100% & 공격력↑", color: "#805AD5" },
      ].map((opt, i) => (
        <g key={i}>
          <rect x={40} y={opt.y} width={295} height={45} rx={10} fill={opt.color + "22"} stroke={opt.color} strokeWidth={1} />
          <text x={60} y={opt.y + 20} fontSize={13} fill="#fff" fontWeight="bold">{opt.name}</text>
          <text x={60} y={opt.y + 36} fontSize={10} fill="#aaa">비용: {opt.cost}</text>
          <rect x={240} y={opt.y + 10} width={80} height={25} rx={8} fill={opt.color} />
          <text x={280} y={opt.y + 28} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="bold">{opt.restore}</text>
        </g>
      ))}
      
      {/* Inventory */}
      <rect x={40} y={478} width={295} height={0} rx={10} />
    </svg>
  </div>
);

const InventoryScreen = () => (
  <div>
    <h2 style={{ color: "#805AD5", margin: "0 0 12px" }}>🎒 인벤토리 화면</h2>
    <svg viewBox="0 0 760 380" style={{ width: "100%", background: "#1a1a2e", borderRadius: 12, border: "1px solid #333" }}>
      <text x={380} y={30} textAnchor="middle" fontSize={16} fill="#805AD5" fontWeight="bold">🎒 인벤토리</text>
      
      {/* Tabs */}
      {["보석 💎", "잼 🍬", "무기 🗡️", "힌트 💡"].map((tab, i) => (
        <g key={i}>
          <rect x={60 + i * 170} y={45} width={150} height={30} rx={8} fill={i === 0 ? "#805AD5" : "#333"} />
          <text x={135 + i * 170} y={65} textAnchor="middle" fontSize={12} fill="#fff">{tab}</text>
        </g>
      ))}
      
      {/* Grid items */}
      {[
        { emoji: "💎", name: "루비", count: 12, color: "#E53E3E" },
        { emoji: "💎", name: "사파이어", count: 8, color: "#4A90D9" },
        { emoji: "💎", name: "에메랄드", count: 5, color: "#48BB78" },
        { emoji: "💎", name: "다이아", count: 2, color: "#fff" },
        { emoji: "💎", name: "토파즈", count: 15, color: "#D69E2E" },
        { emoji: "💎", name: "자수정", count: 7, color: "#805AD5" },
        { emoji: "💎", name: "오팔", count: 0, color: "#666" },
        { emoji: "💎", name: "문스톤", count: 3, color: "#90CDF4" },
      ].map((item, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return (
          <g key={i}>
            <rect x={60 + col * 170} y={90 + row * 130} width={150} height={115} rx={12} fill={item.count > 0 ? "#333" : "#222"} stroke={item.color + "44"} strokeWidth={1} />
            <text x={135 + col * 170} y={140 + row * 130} textAnchor="middle" fontSize={36} opacity={item.count > 0 ? 1 : 0.3}>{item.emoji}</text>
            <text x={135 + col * 170} y={168 + row * 130} textAnchor="middle" fontSize={12} fill={item.count > 0 ? "#fff" : "#555"}>{item.name}</text>
            <text x={135 + col * 170} y={188 + row * 130} textAnchor="middle" fontSize={11} fill={item.count > 0 ? item.color : "#555"}>x{item.count}</text>
          </g>
        );
      })}
    </svg>
  </div>
);

// --- DB Schema ---

const DbSchema = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🗄️ DB 스키마 (ERD)</h2>
    <svg viewBox="0 0 760 600" style={{ width: "100%", background: "#fafbfc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <ArrowDefs />
      
      {/* users */}
      <g>
        <rect x={20} y={20} width={190} height={140} rx={8} fill="#4A90D911" stroke="#4A90D9" strokeWidth={1.5} />
        <rect x={20} y={20} width={190} height={28} rx={8} fill="#4A90D9" />
        <rect x={20} y={40} width={190} height={8} fill="#4A90D9" />
        <text x={115} y={40} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">👤 users</text>
        {["🔑 id (PK)", "name", "level", "total_gems", "total_jams", "created_at"].map((f, i) => (
          <text key={i} x={32} y={68 + i * 16} fontSize={10} fill={i === 0 ? "#4A90D9" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* units */}
      <g>
        <rect x={280} y={20} width={190} height={130} rx={8} fill="#48BB7811" stroke="#48BB78" strokeWidth={1.5} />
        <rect x={280} y={20} width={190} height={28} rx={8} fill="#48BB78" />
        <rect x={280} y={40} width={190} height={8} fill="#48BB78" />
        <text x={375} y={40} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">📚 units</text>
        {["🔑 id (PK)", "name", "description", "order_num", "phonics_focus"].map((f, i) => (
          <text key={i} x={292} y={68 + i * 16} fontSize={10} fill={i === 0 ? "#48BB78" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* stages */}
      <g>
        <rect x={540} y={20} width={200} height={150} rx={8} fill="#D69E2E11" stroke="#D69E2E" strokeWidth={1.5} />
        <rect x={540} y={20} width={200} height={28} rx={8} fill="#D69E2E" />
        <rect x={540} y={40} width={200} height={8} fill="#D69E2E" />
        <text x={640} y={40} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">🗺️ stages</text>
        {["🔑 id (PK)", "🔗 unit_id (FK→units)", "name", "order_num", "monster_count", "required_stars"].map((f, i) => (
          <text key={i} x={552} y={68 + i * 16} fontSize={10} fill={i <= 1 ? "#D69E2E" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* words */}
      <g>
        <rect x={280} y={190} width={190} height={150} rx={8} fill="#805AD511" stroke="#805AD5" strokeWidth={1.5} />
        <rect x={280} y={190} width={190} height={28} rx={8} fill="#805AD5" />
        <rect x={280} y={210} width={190} height={8} fill="#805AD5" />
        <text x={375} y={210} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">📝 words</text>
        {["🔑 id (PK)", "🔗 unit_id (FK→units)", "word", "pronunciation_url", "image_url", "difficulty"].map((f, i) => (
          <text key={i} x={292} y={238 + i * 16} fontSize={10} fill={i <= 1 ? "#805AD5" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* monsters */}
      <g>
        <rect x={540} y={200} width={200} height={150} rx={8} fill="#E53E3E11" stroke="#E53E3E" strokeWidth={1.5} />
        <rect x={540} y={200} width={200} height={28} rx={8} fill="#E53E3E" />
        <rect x={540} y={220} width={200} height={8} fill="#E53E3E" />
        <text x={640} y={220} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">👾 monsters</text>
        {["🔑 id (PK)", "🔗 stage_id (FK→stages)", "🔗 word_id (FK→words)", "type", "hp", "hint_drop_rate", "position_x"].map((f, i) => (
          <text key={i} x={552} y={248 + i * 16} fontSize={10} fill={i <= 2 ? "#E53E3E" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* user_progress */}
      <g>
        <rect x={20} y={200} width={200} height={170} rx={8} fill="#D69E2E11" stroke="#D69E2E" strokeWidth={1.5} />
        <rect x={20} y={200} width={200} height={28} rx={8} fill="#D69E2E" />
        <rect x={20} y={220} width={200} height={8} fill="#D69E2E" />
        <text x={120} y={220} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">📊 user_progress</text>
        {["🔑 id (PK)", "🔗 user_id (FK→users)", "🔗 stage_id (FK→stages)", "stars (0-3)", "is_completed", "best_score", "attempts"].map((f, i) => (
          <text key={i} x={32} y={248 + i * 16} fontSize={10} fill={i <= 2 ? "#D69E2E" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* weapons */}
      <g>
        <rect x={20} y={410} width={200} height={160} rx={8} fill="#E53E3E11" stroke="#E53E3E" strokeWidth={1.5} />
        <rect x={20} y={410} width={200} height={28} rx={8} fill="#E53E3E" />
        <rect x={20} y={430} width={200} height={8} fill="#E53E3E" />
        <text x={120} y={430} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">🗡️ user_weapons</text>
        {["🔑 id (PK)", "🔗 user_id (FK→users)", "name", "durability (0-100)", "attack_power", "repair_cost_jam", "is_equipped"].map((f, i) => (
          <text key={i} x={32} y={458 + i * 16} fontSize={10} fill={i <= 1 ? "#E53E3E" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* quiz_logs */}
      <g>
        <rect x={280} y={380} width={200} height={185} rx={8} fill="#4A90D911" stroke="#4A90D9" strokeWidth={1.5} />
        <rect x={280} y={380} width={200} height={28} rx={8} fill="#4A90D9" />
        <rect x={280} y={400} width={200} height={8} fill="#4A90D9" />
        <text x={380} y={400} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">📋 quiz_logs</text>
        {["🔑 id (PK)", "🔗 user_id (FK)", "🔗 word_id (FK)", "🔗 monster_id (FK)", "quiz_type (voice|spell)", "is_correct", "hints_used", "time_spent_ms", "created_at"].map((f, i) => (
          <text key={i} x={292} y={428 + i * 16} fontSize={10} fill={i <= 3 ? "#4A90D9" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* inventory */}
      <g>
        <rect x={540} y={390} width={200} height={130} rx={8} fill="#48BB7811" stroke="#48BB78" strokeWidth={1.5} />
        <rect x={540} y={390} width={200} height={28} rx={8} fill="#48BB78" />
        <rect x={540} y={410} width={200} height={8} fill="#48BB78" />
        <text x={640} y={410} textAnchor="middle" fontSize={12} fill="#fff" fontWeight="bold">🎒 inventory</text>
        {["🔑 id (PK)", "🔗 user_id (FK→users)", "item_type (gem|jam)", "item_name", "quantity"].map((f, i) => (
          <text key={i} x={552} y={438 + i * 16} fontSize={10} fill={i <= 1 ? "#48BB78" : "#555"}>{f}</text>
        ))}
      </g>
      
      {/* Relations */}
      <line x1={210} y1={80} x2={280} y2={80} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={470} y1={80} x2={540} y2={80} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={375} y1={150} x2={375} y2={190} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={470} y1={270} x2={540} y2={270} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={120} y1={160} x2={120} y2={200} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={120} y1={370} x2={120} y2={410} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={220} y1={300} x2={280} y2={400} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
      <line x1={220} y1={460} x2={540} y2={460} stroke="#aaa" strokeWidth={1} strokeDasharray="4,2" />
    </svg>
  </div>
);

const DbDetail = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>📊 DB 상세 & 샘플 데이터</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {[
        {
          title: "📚 units (파닉스 단원)", color: "#48BB78",
          rows: [
            "id=1, name='Unit 1: Short Vowels', phonics_focus='a,e,i,o,u 단모음'",
            "id=2, name='Unit 2: Consonants F-J', phonics_focus='f,g,h,i,j'",
            "id=3, name='Unit 3: Consonants K-O', phonics_focus='k,l,m,n,o'"
          ]
        },
        {
          title: "📝 words (단어 풀)", color: "#805AD5",
          rows: [
            "id=1, unit_id=1, word='cat', difficulty=1",
            "id=2, unit_id=1, word='bed', difficulty=1",
            "id=3, unit_id=1, word='pig', difficulty=2",
            "id=4, unit_id=2, word='fan', difficulty=1",
            "id=5, unit_id=2, word='hat', difficulty=1"
          ]
        },
        {
          title: "👾 monsters (몬스터)", color: "#E53E3E",
          rows: [
            "id=1, stage_id=1, word_id=1, type='slime'",
            "  hp=100, hint_drop_rate=0.6, pos_x=400",
            "id=2, stage_id=1, word_id=2, type='goblin'",
            "  hp=150, hint_drop_rate=0.5, pos_x=700"
          ]
        },
        {
          title: "🗡️ user_weapons (무기)", color: "#D69E2E",
          rows: [
            "id=1, user_id=1, name='용사의 검'",
            "  durability=75, attack_power=10",
            "  repair_cost_jam=5, is_equipped=true",
            "--- 내구도 감소: 공격당 -10%",
            "--- 30% 이하: 대장간 알림"
          ]
        },
        {
          title: "📋 quiz_logs (학습 기록)", color: "#4A90D9",
          rows: [
            "id=1, user=1, word='cat', type='voice'",
            "  is_correct=true, hints=1, time=3200ms",
            "id=2, user=1, word='cat', type='spelling'",
            "  is_correct=true, hints=2, time=8500ms",
            "--- 학습 리포트용 집계 가능"
          ]
        },
        {
          title: "⚙️ 게임 밸런스 상수", color: "#555",
          rows: [
            "HINT_DROP_RATE: 0.4 ~ 0.7 (몬스터별)",
            "ATTACK_DURABILITY_COST: -10%",
            "REPAIR_BASIC: 잼 5개 → +30%",
            "REPAIR_FULL: 잼 15개 → 100%",
            "STAGE_CLEAR_REWARD: 💎 3~5개",
            "TREASURE_REWARD: 💎 5~10 + 🍬 3~5"
          ]
        }
      ].map((table, i) => (
        <div key={i} style={{ background: "#f8f9fa", borderRadius: 10, padding: 12, border: `1px solid ${table.color}33`, fontSize: 11 }}>
          <div style={{ fontWeight: "bold", color: table.color, marginBottom: 6 }}>{table.title}</div>
          {table.rows.map((r, j) => (
            <div key={j} style={{ color: "#555", lineHeight: 1.7, fontFamily: "monospace", fontSize: 10, paddingLeft: r.startsWith("  ") || r.startsWith("---") ? 12 : 0 }}>
              {r}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ApiScreen = () => (
  <div>
    <h2 style={{ color: "#4A90D9", margin: "0 0 12px" }}>🔌 API 엔드포인트 설계</h2>
    <div style={{ display: "grid", gap: 8 }}>
      {[
        { method: "GET", path: "/api/units", desc: "전체 단원 목록", color: "#48BB78" },
        { method: "GET", path: "/api/units/:id/stages", desc: "단원별 스테이지 목록", color: "#48BB78" },
        { method: "GET", path: "/api/stages/:id", desc: "스테이지 상세 (몬스터, 단어 포함)", color: "#48BB78" },
        { method: "POST", path: "/api/quiz/voice", desc: "음성 퀴즈 답변 제출 {word_id, answer}", color: "#4A90D9" },
        { method: "POST", path: "/api/quiz/spelling", desc: "스펠링 퀴즈 제출 {word_id, spelling}", color: "#4A90D9" },
        { method: "POST", path: "/api/attack", desc: "몬스터 공격 {monster_id, weapon_id} → 힌트+내구도", color: "#E53E3E" },
        { method: "GET", path: "/api/users/:id/progress", desc: "유저 진행 상황", color: "#48BB78" },
        { method: "GET", path: "/api/users/:id/inventory", desc: "유저 인벤토리", color: "#48BB78" },
        { method: "POST", path: "/api/forge/repair", desc: "무기 수리 {weapon_id, repair_type}", color: "#D69E2E" },
        { method: "POST", path: "/api/treasure/open", desc: "보물상자 열기 {stage_id, spelling}", color: "#D69E2E" },
        { method: "GET", path: "/api/users/:id/report", desc: "학습 리포트 (정답률, 취약단어 등)", color: "#48BB78" },
      ].map((api, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <span style={{ background: api.color, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: "bold", minWidth: 40, textAlign: "center" }}>{api.method}</span>
          <code style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>{api.path}</code>
          <span style={{ fontSize: 11, color: "#888", marginLeft: "auto" }}>{api.desc}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, padding: 12, background: "#f0f7ff", borderRadius: 10, border: "1px solid #d0e3f7" }}>
      <h4 style={{ margin: "0 0 8px", color: "#2c5282", fontSize: 13 }}>📡 음성 퀴즈 플로우 (POST /api/quiz/voice)</h4>
      <pre style={{ margin: 0, fontSize: 10, color: "#444", lineHeight: 1.6 }}>{`
Request:  { user_id: 1, word_id: 3, audio_blob: <base64> }
          → 서버에서 Web Speech API or Google STT로 변환
Response: { 
  is_correct: true,
  recognized_text: "pig",
  expected_word: "pig",
  rewards: { gems: 0, jams: 1 },
  monster_defeated: true
}`}</pre>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeScreen, setActiveScreen] = useState("overview");
  
  const renderScreen = () => {
    switch (activeScreen) {
      case "overview": return <OverviewScreen />;
      case "flow": return <FlowScreen />;
      case "screen-main": return <MainScreen />;
      case "screen-map": return <MapScreen />;
      case "screen-game": return <GameScreen />;
      case "screen-monster": return <MonsterScreen />;
      case "screen-treasure": return <TreasureScreen />;
      case "screen-forge": return <ForgeScreen />;
      case "screen-inventory": return <InventoryScreen />;
      case "db-schema": return <DbSchema />;
      case "db-detail": return <DbDetail />;
      case "api": return <ApiScreen />;
      default: return <OverviewScreen />;
    }
  };

  return (
    <div style={{ fontFamily: "-apple-system, sans-serif", maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "#333" }}>🎮 Phonics Adventure</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>와이어프레임 & DB 설계 문서</p>
      </div>
      
      {/* Navigation */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16, justifyContent: "center" }}>
        {screens.map(s => (
          <button
            key={s}
            onClick={() => setActiveScreen(s)}
            style={{
              padding: "6px 12px", borderRadius: 20, border: "none", fontSize: 11,
              background: activeScreen === s ? "#4A90D9" : "#f0f0f0",
              color: activeScreen === s ? "#fff" : "#555",
              cursor: "pointer", fontWeight: activeScreen === s ? "bold" : "normal",
              transition: "all 0.2s"
            }}
          >
            {screenNames[s]}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px #0001", minHeight: 400 }}>
        {renderScreen()}
      </div>
    </div>
  );
}