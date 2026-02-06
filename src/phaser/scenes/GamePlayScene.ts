import Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { Player } from '../objects/Player';
import { Monster } from '../objects/Monster';
import { HintLetter } from '../objects/HintLetter';
import { buildLevel, LevelData } from '../utils/LevelBuilder';
import { MonsterData, Word } from '../../types/game';
import wordsData from '../../data/words.json';

interface GamePlayData {
  stageId: number;
  monsters: MonsterData[];
  treasureWord: string;
}

export class GamePlayScene extends Phaser.Scene {
  private player!: Player;
  private levelData!: LevelData;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private isOverlayOpen: boolean = false;
  private activeHintLetters: HintLetter[] = [];
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private stageId: number = 0;

  constructor() {
    super({ key: 'GamePlay' });
  }

  init(data: GamePlayData) {
    this.stageId = data.stageId;
  }

  create(data: GamePlayData) {
    this.isOverlayOpen = false;
    this.activeHintLetters = [];

    // Build ground
    this.ground = this.physics.add.staticGroup();
    const groundY = 400;

    // Build level
    this.levelData = buildLevel(this, data.monsters, data.treasureWord);

    // Ground collision body
    const groundBody = this.add.rectangle(
      this.levelData.levelWidth / 2, groundY + 10,
      this.levelData.levelWidth, 20,
      0x000000, 0
    );
    this.ground.add(groundBody);

    // Create player
    this.player = new Player(this, 100, groundY - 30);
    this.physics.add.collider(this.player, this.ground);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.levelData.levelWidth, 480);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.physics.world.setBounds(0, 0, this.levelData.levelWidth, 480);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Monster collision detection
    this.levelData.monsters.forEach((monster) => {
      this.physics.add.overlap(this.player, monster, () => {
        if (!monster.isDefeated && !this.isOverlayOpen) {
          this.handleMonsterEncounter(monster);
        }
      });
    });

    // Treasure box collision
    this.physics.add.overlap(this.player, this.levelData.treasureBox, () => {
      if (!this.levelData.treasureBox.isOpened && !this.isOverlayOpen) {
        this.handleTreasureEncounter();
      }
    });

    // Listen for React events
    EventBridge.on(EVENTS.QUIZ_ANSWERED, this.handleQuizAnswered, this);
    EventBridge.on(EVENTS.ATTACK_EXECUTE, this.handleAttackExecute, this);
    EventBridge.on(EVENTS.TREASURE_OPENED, this.handleTreasureOpened, this);
    EventBridge.on(EVENTS.GAME_PAUSE, this.handlePause, this);
    EventBridge.on(EVENTS.GAME_RESUME, this.handleResume, this);

    // Touch/mobile control events
    EventBridge.on(EVENTS.CONTROL_LEFT, () => { if (!this.isOverlayOpen) this.player.moveLeft(); });
    EventBridge.on(EVENTS.CONTROL_RIGHT, () => { if (!this.isOverlayOpen) this.player.moveRight(); });
    EventBridge.on(EVENTS.CONTROL_STOP, () => this.player.stop());
    EventBridge.on(EVENTS.CONTROL_ATTACK, () => {
      if (!this.isOverlayOpen) this.player.attack();
    });

    // Launch UI scene
    this.scene.launch('UI');

    // Start label
    const startLabel = this.add.text(100, 200, '▶ 시작!', {
      fontSize: '28px',
      color: '#FFD700',
      backgroundColor: '#00000088',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startLabel,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => startLabel.destroy(),
    });
  }

  update() {
    if (this.isOverlayOpen) {
      this.player.stop();
      return;
    }

    // Keyboard controls
    if (this.cursors) {
      if (this.cursors.left.isDown) {
        this.player.moveLeft();
      } else if (this.cursors.right.isDown) {
        this.player.moveRight();
      } else {
        this.player.stop();
      }

      if (this.cursors.up.isDown) {
        this.player.jump();
      }
    }

    if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.player.attack();
    }

    // Check hint letter collection
    this.activeHintLetters = this.activeHintLetters.filter((hl) => {
      if (!hl.active) return false;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, hl.x, hl.y);
      if (dist < 50) {
        hl.collect();
        EventBridge.emit(EVENTS.HINT_COLLECTED, { letter: hl.letter });
        return false;
      }
      return true;
    });

    // Check if all monsters defeated -> enable treasure
    const allDefeated = this.levelData.monsters.every(m => m.isDefeated);
    if (allDefeated && !this.levelData.treasureBox.isOpened) {
      // Treasure box is accessible
    }
  }

  private handleMonsterEncounter(monster: Monster) {
    this.isOverlayOpen = true;
    this.player.stop();

    const allWords = wordsData as Word[];
    const word = allWords.find(w => w.id === monster.monsterData.wordId)?.word || 'cat';

    EventBridge.emit(EVENTS.MONSTER_ENCOUNTER, {
      monsterId: monster.monsterData.id,
      wordId: monster.monsterData.wordId,
      word,
      type: monster.monsterData.type,
      hintDropRate: monster.monsterData.hintDropRate,
    });
  }

  private handleTreasureEncounter() {
    const allDefeated = this.levelData.monsters.every(m => m.isDefeated);
    if (!allDefeated) return;

    this.isOverlayOpen = true;
    this.player.stop();

    EventBridge.emit(EVENTS.TREASURE_ENCOUNTER, {
      stageId: this.stageId,
      word: this.levelData.treasureBox.stageWord,
    });
  }

  private handleQuizAnswered = (data: { monsterId: number; correct: boolean }) => {
    if (!this.levelData) return;
    const monster = this.levelData.monsters.find(m => m.monsterData.id === data.monsterId);
    if (!monster) return;

    if (data.correct) {
      monster.defeat();
      this.isOverlayOpen = false;

      // Check stage complete
      const allDefeated = this.levelData.monsters.every(m => m.isDefeated);
      if (allDefeated && this.sys && this.sys.isActive()) {
        try {
          // Show arrow pointing to treasure
          const arrow = this.add.text(
            this.levelData.treasureBox.x,
            this.levelData.treasureBox.y - 60,
            '⬇️', { fontSize: '28px' }
          ).setOrigin(0.5);
          this.tweens.add({
            targets: arrow,
            y: arrow.y + 10,
            duration: 500,
            yoyo: true,
            repeat: -1,
          });
        } catch (e) {
          // Scene may have been destroyed during HMR
        }
      }
    }
  }

  private handleAttackExecute = (_data: { monsterId: number }) => {
    // Attack now defeats monster directly (handled via QUIZ_ANSWERED event)
    // No hint drops - kept for backward compatibility
  }

  private handleTreasureOpened = (data: { success: boolean }) => {
    if (data.success) {
      if (this.levelData) this.levelData.treasureBox.open();
      this.isOverlayOpen = false;

      // Stage complete
      if (this.sys && this.sys.isActive()) {
        this.time.delayedCall(1000, () => {
          EventBridge.emit(EVENTS.STAGE_COMPLETE, { stageId: this.stageId });
        });
      } else {
        // Fallback: emit immediately if scene is not active
        EventBridge.emit(EVENTS.STAGE_COMPLETE, { stageId: this.stageId });
      }
    }
  }

  private handlePause = () => {
    this.scene.pause();
  }

  private handleResume = () => {
    this.scene.resume();
    this.isOverlayOpen = false;
  }

  shutdown() {
    EventBridge.off(EVENTS.QUIZ_ANSWERED, this.handleQuizAnswered, this);
    EventBridge.off(EVENTS.ATTACK_EXECUTE, this.handleAttackExecute, this);
    EventBridge.off(EVENTS.TREASURE_OPENED, this.handleTreasureOpened, this);
    EventBridge.off(EVENTS.GAME_PAUSE, this.handlePause, this);
    EventBridge.off(EVENTS.GAME_RESUME, this.handleResume, this);
    EventBridge.off(EVENTS.CONTROL_LEFT);
    EventBridge.off(EVENTS.CONTROL_RIGHT);
    EventBridge.off(EVENTS.CONTROL_STOP);
    EventBridge.off(EVENTS.CONTROL_ATTACK);
  }
}
