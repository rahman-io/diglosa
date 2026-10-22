import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import {
  AREA_DEF,
  VIL_ENT,
  MKT_ENT,
  SAT_ENT,
  KOT_ENT,
  WKT_ENT,
  CAVE_ENT,
  DOOR,
  WEAPONS,
} from '../data/gameData';
import {
  FOREST_OBSTACLES,
  VILLAGE_OBSTACLES,
  MARKET_OBSTACLES,
  SATWA_OBSTACLES,
  KOTA_OBSTACLES,
  WAKTU_OBSTACLES,
  CAVE_OBSTACLES,
} from '../data/obstacles';
import { NPC_SPR } from '../data/assets';
import { getLevel } from '../utils/gameHelpers';
import { sfx } from '../utils/audio';

interface WorldViewProps {
  gameState: GameState;
  onUpdateState: (partial: Partial<GameState>) => void;
  onOpenPause: () => void;
  onOpenBag: () => void;
  onOpenMap: () => void;
  onStartDuel: (monster: any) => void;
  onStartVocab: (mode: 'cards' | 'quiz' | 'listen' | 'type' | 'match', areaIdx: number) => void;
  onTravel: (mapId: string) => void;
  onOpenDialog: (dialog: any) => void;
}

export const WorldView: React.FC<WorldViewProps> = ({
  gameState,
  onUpdateState,
  onOpenPause,
  onOpenBag,
  onOpenMap,
  onStartDuel,
  onStartVocab,
  onTravel,
  onOpenDialog,
}) => {
  const currentMap = gameState.map || 'hutan';

  // Map background and entities
  const getMapData = () => {
    switch (currentMap) {
      case 'desa':
        return {
          title: 'Desa Sapaan',
          bg: '/village.webp',
          ents: VIL_ENT,
          obstacles: VILLAGE_OBSTACLES,
          areaIndex: 0,
        };
      case 'pasar':
        return {
          title: 'Pasar Rasa',
          bg: '/market.webp',
          ents: MKT_ENT,
          obstacles: MARKET_OBSTACLES,
          areaIndex: 1,
        };
      case 'satwa':
        return {
          title: 'Hutan Satwa',
          bg: '/satwa.webp',
          ents: SAT_ENT,
          obstacles: SATWA_OBSTACLES,
          areaIndex: 2,
        };
      case 'kota':
        return {
          title: 'Gerbang Kota',
          bg: '/kota.webp',
          ents: KOT_ENT,
          obstacles: KOTA_OBSTACLES,
          areaIndex: 3,
        };
      case 'waktu':
        return {
          title: 'Menara Waktu',
          bg: '/waktu.webp',
          ents: WKT_ENT,
          obstacles: WAKTU_OBSTACLES,
          areaIndex: 4,
        };
      case 'portal':
        return {
          title: 'Gua Portal',
          bg: '/cave.webp',
          ents: CAVE_ENT,
          obstacles: CAVE_OBSTACLES,
          areaIndex: 5,
        };
      default:
        return {
          title: 'Hutan Kata',
          bg: '/forest.webp',
          ents: [...AREA_DEF, DOOR],
          obstacles: FOREST_OBSTACLES,
          areaIndex: 0,
        };
    }
  };

  const mapData = getMapData();

  // Player position state
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 500, y: 350 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isShooting, setIsShooting] = useState(false);

  // Wandering Monsters on map
  const [monsters, setMonsters] = useState<any[]>([
    { id: 1, x: 340, y: 280, hp: 3, maxHp: 3, name: 'Gumpal Huruf', dx: 1, dy: 0 },
    { id: 2, x: 680, y: 400, hp: 5, maxHp: 5, name: 'Lendir Kata', dx: -1, dy: 1 },
  ]);

  // Pickups on ground (hearts and diamonds)
  const [pickups, setPickups] = useState<any[]>([
    { id: 'h1', type: 'heart', x: 420, y: 300 },
    { id: 'g1', type: 'gem', x: 580, y: 380 },
    { id: 'g2', type: 'gem', x: 280, y: 420 },
  ]);

  // Projectiles
  const [bullets, setBullets] = useState<any[]>([]);

  // Input states
  const keysDown = useRef<Record<string, boolean>>({});

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        interactWithNearest();
      }
      if (e.key.toLowerCase() === 'f') {
        shootWeapon();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playerPos, mapData]);

  // Game Loop: Player Movement & Collision
  useEffect(() => {
    const loop = setInterval(() => {
      let dx = 0;
      let dy = 0;
      const speed = 4.5;

      if (keysDown.current['arrowleft'] || keysDown.current['a']) dx -= speed;
      if (keysDown.current['arrowright'] || keysDown.current['d']) dx += speed;
      if (keysDown.current['arrowup'] || keysDown.current['w']) dy -= speed;
      if (keysDown.current['arrowdown'] || keysDown.current['s']) dy += speed;

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);
        if (dx < 0) setFacingLeft(true);
        if (dx > 0) setFacingLeft(false);

        setWalkFrame((prev) => (prev + 1) % 6);

        setPlayerPos((prev) => {
          let nextX = Math.max(40, Math.min(960, prev.x + dx));
          let nextY = Math.max(60, Math.min(600, prev.y + dy));

          // Check obstacle collisions
          for (const obs of mapData.obstacles || []) {
            if (Array.isArray(obs) && obs.length >= 3) {
              const [ox, oy, or] = obs;
              const dist = Math.hypot(nextX - ox, nextY - oy);
              if (dist < or + 14) {
                // Collided, push away
                const angle = Math.atan2(nextY - oy, nextX - ox);
                nextX = ox + Math.cos(angle) * (or + 14);
                nextY = oy + Math.sin(angle) * (or + 14);
              }
            }
          }

          // Check pickups
          setPickups((currPickups) =>
            currPickups.filter((p) => {
              if (Math.hypot(nextX - p.x, nextY - p.y) < 28) {
                if (p.type === 'heart') {
                  sfx.pick();
                  onUpdateState({ hp: Math.min(gameState.maxhp, gameState.hp + 1) });
                } else if (p.type === 'gem') {
                  sfx.pick();
                  onUpdateState({ gems: gameState.gems + 1, gemTotal: gameState.gemTotal + 1 });
                }
                return false;
              }
              return true;
            })
          );

          // Check monster collisions
          for (const m of monsters) {
            if (Math.hypot(nextX - m.x, nextY - m.y) < 32) {
              sfx.boss();
              onStartDuel({
                name: m.name,
                hp: m.hp,
                maxHp: m.maxHp,
                areaIndex: mapData.areaIndex,
              });
              break;
            }
          }

          return { x: nextX, y: nextY };
        });
      } else {
        setIsMoving(false);
      }

      // Move bullets
      setBullets((currBullets) =>
        currBullets
          .map((b) => ({ ...b, x: b.x + b.vx, y: b.y + b.vy, life: b.life - 1 }))
          .filter((b) => b.life > 0 && b.x > 0 && b.x < 1000 && b.y > 0 && b.y < 640)
      );
    }, 40);

    return () => clearInterval(loop);
  }, [playerPos, mapData, monsters, gameState]);

  // Interact with nearest NPC / Door
  const interactWithNearest = () => {
    let nearest: any = null;
    let minDist = 75;

    for (const ent of mapData.ents || []) {
      const ex = ent.npc?.x ?? ent.x;
      const ey = ent.npc?.y ?? ent.y;
      if (ex != null && ey != null) {
        const d = Math.hypot(playerPos.x - ex, playerPos.y - ey);
        if (d < minDist) {
          minDist = d;
          nearest = ent;
        }
      }
    }

    if (nearest) {
      sfx.door();
      // If it's Purple Door to Academy
      if (nearest.id === 'door') {
        const crowns = gameState.story?.crown || {};
        const crownCount = Object.keys(crowns).length;
        if (crownCount >= 6 || gameState.storyLock === false) {
          onTravel('akademi');
        } else {
          onOpenDialog({
            speaker: '🔮 Portal Ungu',
            enText: 'The portal is sealed. You must rescue all 6 areas first!',
            idText: `Portal ini tersegel. Masih ada ${6 - crownCount} area yang harus diselamatkan.`,
            options: [{ label: 'Mengerti', action: () => {} }],
          });
        }
        return;
      }

      // If it's an Exit door in inner maps
      if (nearest.id === 'exit' || nearest.n?.includes('Keluar')) {
        onTravel('hutan');
        return;
      }

      // If it's an Area in forest map -> open options to enter or practice
      if (nearest.id && ['desa', 'pasar', 'satwa', 'kota', 'waktu', 'portal'].includes(nearest.id)) {
        onOpenDialog({
          speaker: nearest.npc?.n || nearest.name,
          portrait: `/npc/${nearest.spr || nearest.id}-head.webp`,
          enText: `Welcome to ${nearest.name}! How can I help your journey?`,
          idText: `Selamat datang di ${nearest.name}! Maukah kamu berlatih atau masuk ke wilayah ini?`,
          options: [
            {
              label: `🚪 Masuk ke ${nearest.name}`,
              primary: true,
              action: () => onTravel(nearest.id),
            },
            {
              label: '🃏 Kartu Kilat',
              action: () => onStartVocab('cards', AREA_DEF.findIndex((a) => a.id === nearest.id)),
            },
            {
              label: '⚡ Kuis Kilat',
              action: () => onStartVocab('quiz', AREA_DEF.findIndex((a) => a.id === nearest.id)),
            },
          ],
        });
        return;
      }

      // Inner map activity entities (Sumur, Jembatan, Lumbung, etc.)
      if (nearest.mode) {
        onStartVocab(nearest.mode, mapData.areaIndex);
      } else if (nearest.boss) {
        onStartDuel({
          name: nearest.boss.name,
          hp: nearest.boss.hp || 5,
          maxHp: nearest.boss.hp || 5,
          isBoss: true,
          bossKey: mapData.title.toLowerCase(),
          areaIndex: mapData.areaIndex,
        });
      } else {
        onOpenDialog({
          speaker: nearest.npc?.n || nearest.name || 'Penduduk',
          enText: nearest.say?.[0]?.[0] || 'Keep moving forward, brave hero!',
          idText: nearest.say?.[0]?.[1] || 'Teruslah maju, pahlawan pemberani!',
          options: [{ label: 'Tutup', action: () => {} }],
        });
      }
    }
  };

  // Shoot weapon
  const shootWeapon = () => {
    const curWpn = gameState.gun?.cur || 'ketapel';
    const ammo = gameState.gun?.ammo?.[curWpn] || 0;
    if (ammo <= 0 && gameState.gun?.owned) {
      sfx.no();
      return;
    }

    sfx.shoot();
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 300);

    if (ammo > 0) {
      onUpdateState({
        gun: {
          ...gameState.gun!,
          ammo: { ...gameState.gun!.ammo, [curWpn]: ammo - 1 },
        },
      });
    }

    // Spawn projectile
    const dir = facingLeft ? -1 : 1;
    setBullets((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: playerPos.x + dir * 18,
        y: playerPos.y - 14,
        vx: dir * 12,
        vy: 0,
        life: 40,
      },
    ]);
  };

  const lvl = getLevel(gameState.xp);
  const curAmmo = gameState.gun?.ammo?.[gameState.gun?.cur || 'ketapel'] || 0;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#11051f] flex flex-col font-['Nunito',sans-serif] select-none overflow-hidden text-white">
      {/* Top HUD */}
      <header className="relative z-20 w-full bg-[#1e0c33]/90 border-b border-amber-400/30 px-3 py-2 flex items-center justify-between backdrop-blur-md shadow-md">
        {/* Left: Level & Lives */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.tick();
              onOpenPause();
            }}
            className="w-8 h-8 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-amber-300 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Menu Jeda"
          >
            ☰
          </button>

          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-red-500/30 text-xs font-black">
            <span>❤️</span>
            <span className="text-red-300">{gameState.hp}/{gameState.maxhp}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-cyan-400/30 text-xs font-black">
            <span>💎</span>
            <span className="text-cyan-300">{gameState.gems}</span>
          </div>
        </div>

        {/* Center: Map Title */}
        <div className="text-center font-['Lilita_One',sans-serif] text-base sm:text-lg text-[#ffd24a] tracking-wider drop-shadow">
          {mapData.title}
        </div>

        {/* Right: Ammo & Bag/Map */}
        <div className="flex items-center gap-2">
          {gameState.gun?.owned && (
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-amber-400/30 text-xs font-black">
              <span>🎯</span>
              <span className="text-amber-300">{curAmmo}</span>
            </div>
          )}

          <button
            onClick={() => {
              sfx.door();
              onOpenMap();
            }}
            className="w-8 h-8 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-stone-200 text-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Peta"
          >
            🗺️
          </button>

          <button
            onClick={() => {
              sfx.pick();
              onOpenBag();
            }}
            className="w-8 h-8 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-stone-200 text-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Tas"
          >
            🎒
          </button>
        </div>
      </header>

      {/* Main Adventure SVG Game World Canvas */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        <svg
          viewBox="0 0 1000 640"
          className="w-full h-full max-h-[85vh] object-contain select-none pointer-events-auto"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
            const clickY = ((e.clientY - rect.top) / rect.height) * 640;
            setPlayerPos({ x: Math.round(clickX), y: Math.round(clickY) });
          }}
        >
          {/* Layer 1: Background map painting */}
          <image href={mapData.bg} x="0" y="0" width="1000" height="640" preserveAspectRatio="none" />

          {/* Layer 2: Pickups */}
          {pickups.map((p) => (
            <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle r="12" fill={p.type === 'heart' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 211, 238, 0.3)'} />
              <text y="6" textAnchor="middle" fontSize="16">
                {p.type === 'heart' ? '❤️' : '💎'}
              </text>
            </g>
          ))}

          {/* Layer 3: NPCs & Activity Portals */}
          {(mapData.ents || []).map((ent: any, idx: number) => {
            const ex = ent.npc?.x ?? ent.x;
            const ey = ent.npc?.y ?? ent.y;
            if (ex == null || ey == null) return null;
            const name = ent.npc?.n ?? ent.name ?? 'NPC';
            const icon = ent.npc?.e ?? ent.e ?? '🧙‍♂️';
            const spriteKey = ent.spr || (ent.id && ['desa', 'pasar', 'satwa', 'kota', 'waktu', 'portal'].includes(ent.id) ? ent.id : null);
            const spr = spriteKey ? NPC_SPR?.[spriteKey] : null;

            return (
              <g key={idx} transform={`translate(${ex}, ${ey})`} className="cursor-pointer">
                {/* Speech Bubble "Help!" if area needs rescuing */}
                <g transform="translate(0, -68)" className="animate-bounce">
                  <rect x="-24" y="-14" width="48" height="18" rx="8" fill="#ffbe53" stroke="#8a4b1c" strokeWidth="1.5" />
                  <text y="-1" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1b082c">
                    {ent.id === 'door' ? 'PORTAL' : 'HELP!'}
                  </text>
                </g>

                {/* NPC Avatar / Sprite */}
                {spr?.u?.idle ? (
                  <image
                    href={spr.u.idle}
                    x={-(spr.w / 2)}
                    y={-spr.h}
                    width={spr.w}
                    height={spr.h}
                    preserveAspectRatio="contain"
                  />
                ) : (
                  <text y="0" textAnchor="middle" fontSize="38" className="drop-shadow">
                    {icon}
                  </text>
                )}

                {/* Name Label */}
                <rect x="-40" y="4" width="80" height="15" rx="5" fill="rgba(24, 8, 40, 0.85)" stroke="#ffbe53" strokeWidth="1" />
                <text y="15" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffd24a">
                  {name}
                </text>
              </g>
            );
          })}

          {/* Layer 4: Wandering Monsters */}
          {monsters.map((m) => (
            <g key={m.id} transform={`translate(${m.x}, ${m.y})`} className="cursor-pointer">
              <circle r="16" fill="rgba(168, 85, 247, 0.25)" />
              <text y="8" textAnchor="middle" fontSize="28">
                👾
              </text>
              <rect x="-14" y="-24" width="28" height="13" rx="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
              <text y="-14" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">
                {m.hp}
              </text>
            </g>
          ))}

          {/* Layer 5: Bullets */}
          {bullets.map((b) => (
            <circle
              key={b.id}
              cx={b.x}
              cy={b.y}
              r="4"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}

          {/* Layer 6: Player Character Sprite */}
          <g transform={`translate(${playerPos.x}, ${playerPos.y})`}>
            {/* Player Shadow */}
            <ellipse cx="0" cy="4" rx="14" ry="5" fill="rgba(0,0,0,0.5)" />

            {/* Hero Body */}
            <g transform={facingLeft ? 'scale(-1, 1)' : 'scale(1, 1)'}>
              {isMoving ? (
                <image
                  href="/hero-walk.webp"
                  x="-25"
                  y="-56"
                  width="50"
                  height="60"
                  preserveAspectRatio="none"
                />
              ) : (
                <image
                  href="/hero.webp"
                  x="-18"
                  y="-56"
                  width="36"
                  height="60"
                  preserveAspectRatio="contain"
                />
              )}
            </g>

            {/* Kick / Firing Flash */}
            {isShooting && (
              <circle cx={facingLeft ? -20 : 20} cy="-24" r="7" fill="#facc15" className="animate-ping" />
            )}
          </g>
        </svg>

        {/* On-Screen Mobile Touch Controls Overlay */}
        <div className="absolute inset-x-0 bottom-3 z-30 px-4 flex items-end justify-between pointer-events-none">
          {/* Virtual D-pad (Left) */}
          <div className="relative w-32 h-32 pointer-events-auto select-none">
            <button
              onMouseDown={() => (keysDown.current['w'] = true)}
              onMouseUp={() => (keysDown.current['w'] = false)}
              onTouchStart={() => (keysDown.current['w'] = true)}
              onTouchEnd={() => (keysDown.current['w'] = false)}
              className="absolute top-0 left-11 w-10 h-10 rounded-xl bg-purple-950/80 border-2 border-amber-400/50 text-white font-black text-lg active:bg-amber-500 active:text-stone-900 flex items-center justify-center shadow-md cursor-pointer"
            >
              ▲
            </button>
            <button
              onMouseDown={() => (keysDown.current['s'] = true)}
              onMouseUp={() => (keysDown.current['s'] = false)}
              onTouchStart={() => (keysDown.current['s'] = true)}
              onTouchEnd={() => (keysDown.current['s'] = false)}
              className="absolute bottom-0 left-11 w-10 h-10 rounded-xl bg-purple-950/80 border-2 border-amber-400/50 text-white font-black text-lg active:bg-amber-500 active:text-stone-900 flex items-center justify-center shadow-md cursor-pointer"
            >
              ▼
            </button>
            <button
              onMouseDown={() => (keysDown.current['a'] = true)}
              onMouseUp={() => (keysDown.current['a'] = false)}
              onTouchStart={() => (keysDown.current['a'] = true)}
              onTouchEnd={() => (keysDown.current['a'] = false)}
              className="absolute top-11 left-0 w-10 h-10 rounded-xl bg-purple-950/80 border-2 border-amber-400/50 text-white font-black text-lg active:bg-amber-500 active:text-stone-900 flex items-center justify-center shadow-md cursor-pointer"
            >
              ◀
            </button>
            <button
              onMouseDown={() => (keysDown.current['d'] = true)}
              onMouseUp={() => (keysDown.current['d'] = false)}
              onTouchStart={() => (keysDown.current['d'] = true)}
              onTouchEnd={() => (keysDown.current['d'] = false)}
              className="absolute top-11 right-0 w-10 h-10 rounded-xl bg-purple-950/80 border-2 border-amber-400/50 text-white font-black text-lg active:bg-amber-500 active:text-stone-900 flex items-center justify-center shadow-md cursor-pointer"
            >
              ▶
            </button>
          </div>

          {/* Action & Shoot Buttons (Right) */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {gameState.gun?.owned && (
              <button
                onClick={shootWeapon}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-amber-500 border-2 border-yellow-300 shadow-xl active:scale-95 flex flex-col items-center justify-center text-white cursor-pointer"
                title="Tembak (F)"
              >
                <span className="text-xl">🎯</span>
                <span className="text-[10px] font-black">{curAmmo}</span>
              </button>
            )}

            <button
              onClick={interactWithNearest}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-yellow-200 shadow-xl active:scale-95 flex flex-col items-center justify-center text-stone-900 font-['Lilita_One',sans-serif] text-sm cursor-pointer"
              title="Bicara / Aksi (E)"
            >
              <span className="text-2xl">💬</span>
              <span>Aksi</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
