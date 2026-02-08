import Phaser from 'phaser';

export class TreasureBox extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public isOpened: boolean = false;
  public stageWord: string;
  private sprite: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, word: string) {
    super(scene, x, y);
    this.stageWord = word;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Treasure box emoji
    this.sprite = scene.add.text(0, 0, '📦', { fontSize: '44px' }).setOrigin(0.5);
    this.add(this.sprite);

    // Sparkle effect
    const sparkle = scene.add.text(0, -30, '✨', { fontSize: '20px' }).setOrigin(0.5);
    this.add(sparkle);
    scene.tweens.add({
      targets: sparkle,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Physics
    this.body.setSize(50, 50);
    this.body.setOffset(-25, -25);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
  }

  open() {
    this.isOpened = true;

    // Safety check: ensure scene and sprite are still valid
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
    if (!this.sprite || !this.sprite.active) return;

    try {
      this.sprite.setText('🎁');
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
      });
    } catch (e) {
      // Scene may have been destroyed during HMR or navigation
      console.warn('[TreasureBox] open() error ignored:', e);
    }
  }
}
