import Phaser from 'phaser';
import { MonsterData } from '../../types/game';

export class Monster extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public monsterData: MonsterData;
  public word: string;
  public isDefeated: boolean = false;
  private sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private wordBubble: Phaser.GameObjects.Text;
  private triggerZone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, data: MonsterData, word: string) {
    super(scene, data.positionX, 0);
    this.monsterData = data;
    this.word = word;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Monster sprite - try image texture, fallback to colored circle
    const MONSTER_SIZE = 96;
    const textureKey = data.type;
    if (scene.textures.exists(textureKey) && scene.textures.get(textureKey).key !== '__MISSING') {
      const img = scene.add.image(0, 0, textureKey).setOrigin(0.5);
      img.setDisplaySize(MONSTER_SIZE, MONSTER_SIZE);
      this.sprite = img;
    } else {
      // Fallback: colored circle with eyes
      const gfx = scene.add.graphics();
      const colors = [0xFF6B6B, 0x6BCB77, 0x4D96FF, 0xFFD93D, 0xFF8C32,
                      0xC77DFF, 0x00B4D8, 0xE76F51, 0x2EC4B6, 0xF72585];
      const typeNum = parseInt(data.type.replace('monster_', ''), 10) || 1;
      const color = colors[(typeNum - 1) % colors.length];
      const r = MONSTER_SIZE / 2;
      gfx.fillStyle(color, 1);
      gfx.fillCircle(0, 0, r);
      gfx.fillStyle(0x000000, 0.3);
      gfx.fillCircle(-10, -10, 8);
      gfx.fillCircle(10, -10, 8);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(-10, -10, 5);
      gfx.fillCircle(10, -10, 5);
      this.sprite = gfx;
    }
    this.add(this.sprite);

    // Word bubble above monster
    this.wordBubble = scene.add.text(0, -(MONSTER_SIZE / 2 + 16), `"${word}"`, {
      fontSize: '18px',
      color: '#FFD700',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
    this.add(this.wordBubble);

    // Idle animation: gentle bounce
    scene.tweens.add({
      targets: this.sprite,
      y: -8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Physics body sized to match monster
    this.body.setSize(MONSTER_SIZE - 8, MONSTER_SIZE);
    this.body.setOffset(-(MONSTER_SIZE - 8) / 2, -MONSTER_SIZE / 2);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    // Trigger zone (larger than the monster for detection)
    this.triggerZone = scene.add.zone(0, 0, MONSTER_SIZE + 40, MONSTER_SIZE + 20);
    this.add(this.triggerZone);
    scene.physics.add.existing(this.triggerZone, true);
  }

  getTriggerZone(): Phaser.GameObjects.Zone {
    return this.triggerZone;
  }

  defeat() {
    this.isDefeated = true;
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.setActive(false).setVisible(false);
        },
      });
    } else {
      this.setActive(false).setVisible(false);
    }
  }
}
