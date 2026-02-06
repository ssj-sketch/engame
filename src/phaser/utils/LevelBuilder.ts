import Phaser from 'phaser';
import { MonsterData, Word } from '../../types/game';
import { Monster } from '../objects/Monster';
import { TreasureBox } from '../objects/TreasureBox';
import { BALANCE } from '../../data/gameBalance';
import wordsData from '../../data/words.json';

export interface LevelData {
  monsters: Monster[];
  treasureBox: TreasureBox;
  levelWidth: number;
  groundY: number;
}

export function buildLevel(
  scene: Phaser.Scene,
  stageMonsters: MonsterData[],
  treasureWord: string
): LevelData {
  const groundY = 400;
  const lastMonsterX = stageMonsters.length > 0
    ? Math.max(...stageMonsters.map(m => m.positionX))
    : 500;
  const levelWidth = lastMonsterX + BALANCE.LEVEL_PADDING;

  // Draw sky gradient background
  const skyGraphics = scene.add.graphics();
  skyGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F0FF, 0xE0F0FF, 1);
  skyGraphics.fillRect(0, 0, levelWidth, groundY);
  skyGraphics.setScrollFactor(0.2); // Parallax

  // Draw clouds
  for (let cx = 100; cx < levelWidth; cx += 300 + Math.random() * 200) {
    const cloud = scene.add.text(cx, 40 + Math.random() * 80, '☁️', {
      fontSize: `${24 + Math.floor(Math.random() * 20)}px`,
    }).setAlpha(0.7);
    cloud.setScrollFactor(0.3);
  }

  // Draw ground
  const groundGraphics = scene.add.graphics();
  groundGraphics.fillStyle(0x5D8233, 1);
  groundGraphics.fillRect(0, groundY, levelWidth, 80);
  // Dirt layer
  groundGraphics.fillStyle(0x8B6914, 1);
  groundGraphics.fillRect(0, groundY + 20, levelWidth, 60);

  // Ground physics body
  const ground = scene.physics.add.staticGroup();
  const groundBody = scene.add.rectangle(levelWidth / 2, groundY + 10, levelWidth, 20, 0x5D8233, 0);
  ground.add(groundBody);

  // Decorative grass tufts
  for (let gx = 50; gx < levelWidth; gx += 80 + Math.random() * 60) {
    scene.add.text(gx, groundY - 15, '🌿', { fontSize: '16px' }).setAlpha(0.6);
  }

  // Create monsters
  const allWords = wordsData as Word[];
  const monsters: Monster[] = stageMonsters.map((md) => {
    const word = allWords.find(w => w.id === md.wordId)?.word || 'cat';
    const monster = new Monster(scene, md, word);
    monster.setPosition(md.positionX, groundY - 30);
    scene.physics.add.collider(monster, ground);
    return monster;
  });

  // Create treasure box at end of level
  const treasureX = lastMonsterX + BALANCE.MONSTER_SPACING;
  const treasureBox = new TreasureBox(scene, treasureX, groundY - 30, treasureWord);
  scene.physics.add.collider(treasureBox, ground);

  return {
    monsters,
    treasureBox,
    levelWidth,
    groundY,
  };
}
