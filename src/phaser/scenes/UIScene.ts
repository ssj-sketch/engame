import Phaser from 'phaser';
import { EventBridge } from '../EventBridge';

export class UIScene extends Phaser.Scene {
  private gemsText!: Phaser.GameObjects.Text;
  private jamsText!: Phaser.GameObjects.Text;
  private durabilityText!: Phaser.GameObjects.Text;
  private durabilityBar!: Phaser.GameObjects.Graphics;
  private gems: number = 0;
  private jams: number = 0;
  private durability: number = 100;

  constructor() {
    super({ key: 'UI' });
  }

  create() {
    // Background bar
    this.add.rectangle(400, 20, 800, 40, 0x000000, 0.5);

    // Gems display
    this.add.text(16, 8, '💎', { fontSize: '20px' });
    this.gemsText = this.add.text(42, 12, '0', { fontSize: '16px', color: '#FFD700' });

    // Jams display
    this.add.text(110, 8, '🫙', { fontSize: '20px' });
    this.jamsText = this.add.text(136, 12, '0', { fontSize: '16px', color: '#FF69B4' });

    // Weapon durability
    this.add.text(210, 8, '⚔️', { fontSize: '20px' });
    this.durabilityBar = this.add.graphics();
    this.durabilityText = this.add.text(280, 12, '100%', { fontSize: '14px', color: '#fff' });
    this.drawDurabilityBar();

    // Listen for HUD updates (guard against calls before scene is fully ready)
    EventBridge.on('hud:update', (data: { gems?: number; jams?: number; durability?: number }) => {
      if (data.gems !== undefined) {
        this.gems = data.gems;
        if (this.gemsText?.active) this.gemsText.setText(String(this.gems));
      }
      if (data.jams !== undefined) {
        this.jams = data.jams;
        if (this.jamsText?.active) this.jamsText.setText(String(this.jams));
      }
      if (data.durability !== undefined) {
        this.durability = data.durability;
        if (this.durabilityText?.active) {
          this.durabilityText.setText(`${this.durability}%`);
          this.drawDurabilityBar();
        }
      }
    });

    // Emit initial values now that UI is ready
    EventBridge.emit('hud:update', {
      gems: this.gems,
      jams: this.jams,
      durability: this.durability,
    });
  }

  private drawDurabilityBar() {
    this.durabilityBar.clear();
    // Background
    this.durabilityBar.fillStyle(0x333333, 1);
    this.durabilityBar.fillRect(236, 14, 40, 12);
    // Fill
    const color = this.durability > 50 ? 0x48BB78 : this.durability > 25 ? 0xD69E2E : 0xE53E3E;
    this.durabilityBar.fillStyle(color, 1);
    this.durabilityBar.fillRect(236, 14, (this.durability / 100) * 40, 12);
  }
}
