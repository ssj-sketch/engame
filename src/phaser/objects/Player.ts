import Phaser from 'phaser';
import { BALANCE } from '../../data/gameBalance';

export class Player extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Text;
  private isAttacking: boolean = false;
  private attackCooldown: boolean = false;
  private facing: 'left' | 'right' = 'right';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Emoji character sprite
    this.sprite = scene.add.text(0, 0, '🧙‍♂️', { fontSize: '40px' }).setOrigin(0.5);
    this.add(this.sprite);

    // Physics body
    this.body.setSize(36, 48);
    this.body.setOffset(-18, -24);
    this.body.setCollideWorldBounds(true);
  }

  moveLeft() {
    if (this.isAttacking) return;
    this.body.setVelocityX(-BALANCE.PLAYER_SPEED);
    this.facing = 'left';
    this.sprite.setFlipX(true);
  }

  moveRight() {
    if (this.isAttacking) return;
    this.body.setVelocityX(BALANCE.PLAYER_SPEED);
    this.facing = 'right';
    this.sprite.setFlipX(false);
  }

  stop() {
    this.body.setVelocityX(0);
  }

  jump() {
    if (this.body.blocked.down || this.body.touching.down) {
      this.body.setVelocityY(BALANCE.PLAYER_JUMP);
    }
  }

  attack(): boolean {
    if (this.attackCooldown || this.isAttacking) return false;

    this.isAttacking = true;
    this.attackCooldown = true;
    this.sprite.setText('⚔️');

    this.scene.time.delayedCall(300, () => {
      this.sprite.setText('🧙‍♂️');
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(BALANCE.ATTACK_COOLDOWN, () => {
      this.attackCooldown = false;
    });

    return true;
  }

  getAttackBounds(): Phaser.Geom.Rectangle {
    const offsetX = this.facing === 'right' ? 20 : -56;
    return new Phaser.Geom.Rectangle(this.x + offsetX, this.y - 24, 36, 48);
  }
}
