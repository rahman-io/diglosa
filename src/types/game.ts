export type Difficulty = 'santai' | 'petualang' | 'pendekar';
export type FXMode = 'full' | 'lite' | 'off';

export interface WordProgress {
  r: number; // right count
  w: number; // wrong count
  l?: number; // last answered timestamp
}

export interface GunState {
  cur: string;
  owned: boolean;
  ammo: Record<string, number>;
}

export interface StoryState {
  crown: Record<string, boolean>;
  items: Record<string, boolean>;
  ribbons: Record<string, boolean>;
}

export interface InnerAreaState {
  d: Record<string, boolean>; // door/stage cleared
  boss: number; // boss beaten flag
}

export interface GameState {
  p: Record<number, WordProgress>;
  xp: number;
  streak: number;
  last: string;
  day: { d: string; n: number };
  sound: boolean;
  topic: number;
  map: string;
  ctrl: 'joystick' | 'dpad';
  autofs: boolean;
  hp: number;
  maxhp: number;
  gems: number;
  gemTotal: number;
  kills: number;
  diff: Difficulty;
  won: Record<string, boolean>;
  adv: {
    done: Record<string, boolean>;
    portal: number;
    msgDay: string;
    castle: number;
  };
  storyLock?: boolean;
  qtimer?: 'on' | 'off';
  fx?: FXMode;
  gun?: GunState;
  story?: StoryState;
  drops?: Record<string, Array<{ x: number; y: number; kind: 'heart' | 'gem' | 'drop' }>>;
  shot?: Record<string, { killed: number; gems: number }>;
  deal?: Record<string, any>;
  rpg?: {
    intro?: boolean;
    seq?: string;
    won?: Record<string, boolean>;
    in?: Record<string, boolean>;
    defeat?: string | null;
  };
  vil?: InnerAreaState;
  mkt?: InnerAreaState;
  sat?: InnerAreaState;
  kot?: InnerAreaState;
  wkt?: InnerAreaState;
  cave?: InnerAreaState;
}

export interface WeaponDef {
  id: string;
  name: string;
  ammoKey: string;
  dmg: number;
  speed: number;
  desc: string;
  cost: number;
  color: string;
  spriteIndex: number;
}
