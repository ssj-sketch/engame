import Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { TOTAL_MONSTER_TYPES } from '../../data/monsterTypes';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Progress bar
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading...', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4A90D9, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Track load errors
    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.error('[PreloadScene] Failed to load:', fileObj.key, fileObj.url);
    });

    // Load character sprites
    const characters = ['knight', 'archer', 'viking'];
    characters.forEach(name => {
      this.load.image(`char_${name}`, `${process.env.PUBLIC_URL || ''}/assets/characters/${name}.png`);
    });

    // Load all 80 monster sprites
    for (let i = 1; i <= TOTAL_MONSTER_TYPES; i++) {
      const key = `monster_${String(i).padStart(2, '0')}`;
      this.load.image(key, `${process.env.PUBLIC_URL || ''}/assets/monsters/${key}.png`);
    }
  }

  create() {
    // Verify textures loaded
    let loaded = 0;
    for (let i = 1; i <= TOTAL_MONSTER_TYPES; i++) {
      const key = `monster_${String(i).padStart(2, '0')}`;
      if (this.textures.exists(key)) {
        loaded++;
      } else {
        console.warn(`[PreloadScene] Texture missing: ${key}`);
      }
    }
    console.log(`[PreloadScene] Monster textures loaded: ${loaded}/${TOTAL_MONSTER_TYPES}`);

    EventBridge.emit(EVENTS.SCENE_READY);
  }
}
