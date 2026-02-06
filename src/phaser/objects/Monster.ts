import Phaser from 'phaser';
import { MonsterData } from '../../types/game';

const MONSTER_EMOJI: Record<string, string> = {
  slime: '🟢',
  goblin: '👾',
  dragon: '🐉',
};

export class Monster extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public monsterData: MonsterData;
  public word: string;
  public isDefeated: boolean = false;
  private sprite: Phaser.GameObjects.Text;
  private wordBubble: Phaser.GameObjects.Text;
  private triggerZone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, data: MonsterData, word: string) {
    super(scene, data.positionX, 0);
    this.monsterData = data;
    this.word = word;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Monster emoji sprite
    const emoji = MONSTER_EMOJI[data.type] || '👹';
    this.sprite = scene.add.text(0, 0, emoji, { fontSize: '44px' }).setOrigin(0.5);
    this.add(this.sprite);

    // Word bubble above monster
    this.wordBubble = scene.add.text(0, -40, `"${word}"`, {
      fontSize: '16px',
      color: '#FFD700',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5);
    this.add(this.wordBubble);

    // Idle animation: gentle bounce
    scene.tweens.add({
      targets: this.sprite,
      y: -6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Physics
    this.body.setSize(44, 52);
    this.body.setOffset(-22, -26);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    // Trigger zone (larger than the monster for detection)
    this.triggerZone = scene.add.zone(0, 0, 100, 80);
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
