import Phaser from 'phaser';

class GameEventBridge extends Phaser.Events.EventEmitter {
  private static instance: GameEventBridge;

  static getInstance(): GameEventBridge {
    if (!GameEventBridge.instance) {
      GameEventBridge.instance = new GameEventBridge();
    }
    return GameEventBridge.instance;
  }
}

export const EventBridge = GameEventBridge.getInstance();

// Event type constants
export const EVENTS = {
  // Phaser -> React
  MONSTER_ENCOUNTER: 'monster:encounter',
  TREASURE_ENCOUNTER: 'treasure:encounter',
  HINT_COLLECTED: 'hint:collected',
  STAGE_COMPLETE: 'stage:complete',
  PLAYER_WEAPON_BROKEN: 'player:weapon-broken',
  SCENE_READY: 'scene:ready',

  // React -> Phaser
  QUIZ_ANSWERED: 'quiz:answered',
  ATTACK_EXECUTE: 'attack:execute',
  TREASURE_OPENED: 'treasure:opened',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  CONTROL_LEFT: 'control:left',
  CONTROL_RIGHT: 'control:right',
  CONTROL_ATTACK: 'control:attack',
  CONTROL_STOP: 'control:stop',
};
