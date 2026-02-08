import Phaser from 'phaser';
import { BALANCE } from '../../data/gameBalance';

const PLAYER_SIZE = 72;

export class Player extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Image;
  private attackEffect: Phaser.GameObjects.Text;
  private isAttacking: boolean = false;
  private attackCooldown: boolean = false;
  private facing: 'left' | 'right' = 'right';
  private characterType: string;
  private weaponEmoji: string;

  constructor(scene: Phaser.Scene, x: number, y: number, characterType: string = 'knight', weaponEmoji: string = '⚔️') {
    super(scene, x, y);
    this.characterType = characterType;
    this.weaponEmoji = weaponEmoji;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Character image sprite
    const textureKey = `char_${characterType}`;
    const key = scene.textures.exists(textureKey) ? textureKey : 'char_knight';
    this.sprite = scene.add.image(0, 0, key).setOrigin(0.5);
    this.sprite.setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);
    this.add(this.sprite);

    // Attack effect (hidden by default)
    this.attackEffect = scene.add.text(
      this.facing === 'right' ? 30 : -30, -10, this.weaponEmoji,
      { fontSize: '24px' }
    ).setOrigin(0.5).setVisible(false);
    this.add(this.attackEffect);

    // Physics body
    this.body.setSize(40, 60);
    this.body.setOffset(-20, -30);
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

    // Show attack effect
    this.attackEffect.setPosition(this.facing === 'right' ? 40 : -40, -10);
    this.attackEffect.setVisible(true);

    // Attack animation - quick scale pulse
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 1.15,
      scaleY: this.sprite.scaleY * 1.15,
      duration: 100,
      yoyo: true,
    });

    this.scene.time.delayedCall(300, () => {
      this.attackEffect.setVisible(false);
      this.isAttacking = false;
    });

    this.scene.time.delayedCall(BALANCE.ATTACK_COOLDOWN, () => {
      this.attackCooldown = false;
    });

    return true;
  }

  getAttackBounds(): Phaser.Geom.Rectangle {
    const offsetX = this.facing === 'right' ? 24 : -64;
    return new Phaser.Geom.Rectangle(this.x + offsetX, this.y - 30, 40, 60);
  }
}
