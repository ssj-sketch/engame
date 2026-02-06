import Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    // For MVP we use emoji text and graphics API - no image assets to load
    // Show a simple loading indicator
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('complete', () => {
      loadingText.destroy();
    });
  }

  create() {
    EventBridge.emit(EVENTS.SCENE_READY);
    // Wait for GamePlayScene to be started from React
  }
}
