import Phaser from 'phaser';

export class HintLetter extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public letter: string;
  private collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, letter: string) {
    super(scene, x, y);
    this.letter = letter;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Letter display
    const bg = scene.add.circle(0, 0, 16, 0xFFD700, 0.9);
    this.add(bg);

    const text = scene.add.text(0, 0, letter.toUpperCase(), {
      fontSize: '18px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(text);

    // Float upward animation
    scene.tweens.add({
      targets: this,
      y: y - 40,
      duration: 600,
      ease: 'Power2',
    });

    // Bobbing
    scene.tweens.add({
      targets: this,
      y: y - 50,
      duration: 500,
      yoyo: true,
      repeat: -1,
      delay: 600,
      ease: 'Sine.easeInOut',
    });

    // Physics
    this.body.setSize(32, 32);
    this.body.setOffset(-16, -16);
    this.body.setAllowGravity(false);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => this.destroy(),
    });
  }
}
