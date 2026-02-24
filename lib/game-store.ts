// Solo Leveling System - Game State Management

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'National';

export interface PlayerStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  perception: number;
  availablePoints: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  manaCost: number;
  damage?: number;
  cooldown: number;
  type: 'active' | 'passive';
  unlocked: boolean;
  requiredLevel: number;
  icon: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'key' | 'rune';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  equipped?: boolean;
  stats?: Partial<PlayerStats>;
  icon: string;
  sellPrice: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'story' | 'emergency' | 'penalty';
  objectives: { description: string; current: number; target: number }[];
  rewards: { exp: number; gold: number; items?: string[] };
  completed: boolean;
  active: boolean;
  timeLimit?: number;
}

export interface Shadow {
  id: string;
  name: string;
  rank: HunterRank;
  level: number;
  type: string;
  power: number;
  icon: string;
}

export interface DungeonInfo {
  id: string;
  name: string;
  rank: HunterRank;
  recommendedLevel: number;
  rewards: { exp: number; gold: number; items: string[] };
  boss: string;
  cleared: boolean;
  floors: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'rune';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<PlayerStats>;
  icon: string;
}

export interface PlayerData {
  name: string;
  title: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  hunterRank: HunterRank;
  stats: PlayerStats;
  skills: Skill[];
  inventory: InventoryItem[];
  quests: Quest[];
  shadows: Shadow[];
  dungeonHistory: string[];
  totalDungeonClears: number;
  totalMonstersKilled: number;
  daysActive: number;
  fatigue: number;
  maxFatigue: number;
  jobClass: string;
}

// ===== DEFAULT DATA =====

const DEFAULT_SKILLS: Skill[] = [
  { id: 'slash', name: 'Dagger Slash', description: 'A swift slash with a dagger dealing physical damage.', level: 1, maxLevel: 10, manaCost: 5, damage: 15, cooldown: 2, type: 'active', unlocked: true, requiredLevel: 1, icon: 'Sword' },
  { id: 'stealth', name: 'Stealth', description: 'Become invisible to enemies for a short duration.', level: 1, maxLevel: 5, manaCost: 20, cooldown: 30, type: 'active', unlocked: true, requiredLevel: 1, icon: 'Eye' },
  { id: 'sprint', name: 'Sprint', description: 'Increase movement speed by 40%.', level: 1, maxLevel: 5, manaCost: 10, cooldown: 15, type: 'active', unlocked: true, requiredLevel: 1, icon: 'Zap' },
  { id: 'bloodlust', name: 'Bloodlust', description: 'Increase attack power based on enemies killed.', level: 0, maxLevel: 10, manaCost: 0, cooldown: 0, type: 'passive', unlocked: false, requiredLevel: 5, icon: 'Flame' },
  { id: 'rulers_authority', name: "Ruler's Authority", description: 'Telekinetic power to move objects and enemies.', level: 0, maxLevel: 10, manaCost: 30, damage: 50, cooldown: 10, type: 'active', unlocked: false, requiredLevel: 10, icon: 'Hand' },
  { id: 'shadow_extraction', name: 'Shadow Extraction', description: 'Extract shadows from defeated enemies to join your army.', level: 0, maxLevel: 10, manaCost: 50, cooldown: 60, type: 'active', unlocked: false, requiredLevel: 15, icon: 'Ghost' },
  { id: 'shadow_exchange', name: 'Shadow Exchange', description: 'Swap positions with any of your shadows instantly.', level: 0, maxLevel: 5, manaCost: 40, cooldown: 45, type: 'active', unlocked: false, requiredLevel: 20, icon: 'ArrowLeftRight' },
  { id: 'domain_expansion', name: 'Domain of the Monarch', description: 'Unleash the full power of the Shadow Monarch, buffing all shadows.', level: 0, maxLevel: 3, manaCost: 100, damage: 200, cooldown: 120, type: 'active', unlocked: false, requiredLevel: 30, icon: 'Crown' },
  { id: 'passive_regen', name: 'Advanced Recovery', description: 'Passively regenerate HP over time.', level: 0, maxLevel: 10, manaCost: 0, cooldown: 0, type: 'passive', unlocked: false, requiredLevel: 3, icon: 'Heart' },
  { id: 'critical_strike', name: 'Critical Strike', description: 'Chance to deal double damage on attacks.', level: 0, maxLevel: 10, manaCost: 0, cooldown: 0, type: 'passive', unlocked: false, requiredLevel: 7, icon: 'Target' },
  { id: 'tenacity', name: 'Tenacity', description: 'Reduce incoming damage by a percentage.', level: 0, maxLevel: 10, manaCost: 0, cooldown: 0, type: 'passive', unlocked: false, requiredLevel: 12, icon: 'Shield' },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'rusty_dagger', name: 'Rusty Dagger', description: 'A worn dagger, barely sharp.', type: 'weapon', rarity: 'common', quantity: 1, equipped: true, stats: { strength: 2 }, icon: 'Sword', sellPrice: 5 },
  { id: 'cloth_armor', name: 'Cloth Armor', description: 'Basic protection made of cloth.', type: 'armor', rarity: 'common', quantity: 1, equipped: true, stats: { vitality: 2 }, icon: 'Shield', sellPrice: 5 },
  { id: 'hp_potion_small', name: 'Small HP Potion', description: 'Restores 50 HP.', type: 'potion', rarity: 'common', quantity: 3, icon: 'Droplet', sellPrice: 10 },
  { id: 'mp_potion_small', name: 'Small MP Potion', description: 'Restores 30 MP.', type: 'potion', rarity: 'common', quantity: 2, icon: 'Sparkles', sellPrice: 10 },
];

const DEFAULT_QUESTS: Quest[] = [
  // DAILY QUESTS - repeatable each "day" with generous rewards
  {
    id: 'daily_1', title: 'Daily Training', description: 'Complete your daily training regime. Warning: Failing to complete will trigger a Penalty Quest.',
    type: 'daily',
    objectives: [
      { description: 'Push-ups', current: 0, target: 100 },
      { description: 'Sit-ups', current: 0, target: 100 },
      { description: 'Squats', current: 0, target: 100 },
      { description: 'Run (km)', current: 0, target: 10 },
    ],
    rewards: { exp: 120, gold: 80 }, completed: false, active: true,
  },
  {
    id: 'daily_2', title: 'Defeat Monsters', description: 'Slay monsters to prove your worth as a Hunter.',
    type: 'daily',
    objectives: [{ description: 'Monsters defeated', current: 0, target: 5 }],
    rewards: { exp: 80, gold: 60 }, completed: false, active: true,
  },
  {
    id: 'daily_3', title: 'Clear a Dungeon', description: 'Enter and clear any dungeon to gain combat experience.',
    type: 'daily',
    objectives: [{ description: 'Dungeons cleared', current: 0, target: 1 }],
    rewards: { exp: 100, gold: 80 }, completed: false, active: true,
  },
  {
    id: 'daily_4', title: 'Meditation', description: 'Focus your mind to increase your magical power.',
    type: 'daily',
    objectives: [{ description: 'Meditation sessions', current: 0, target: 3 }],
    rewards: { exp: 60, gold: 40 }, completed: false, active: true,
  },
  // STORY QUESTS - big one-time rewards
  {
    id: 'story_1', title: 'The Double Dungeon', description: 'Survive the mysterious double dungeon and uncover the secret of the System.',
    type: 'story',
    objectives: [
      { description: 'Reach the throne room', current: 0, target: 1 },
      { description: 'Survive the trial', current: 0, target: 1 },
    ],
    rewards: { exp: 300, gold: 200, items: ['System Activation Key'] }, completed: false, active: true,
  },
  {
    id: 'story_2', title: 'Awakening', description: 'Discover your true power as the System Player. Reach Level 5.',
    type: 'story',
    objectives: [{ description: 'Reach Level 5', current: 0, target: 1 }],
    rewards: { exp: 200, gold: 300 }, completed: false, active: true,
  },
  {
    id: 'story_3', title: 'Job Change Quest', description: 'Prove yourself worthy of a job class. Reach Level 15.',
    type: 'story',
    objectives: [{ description: 'Reach Level 15', current: 0, target: 1 }],
    rewards: { exp: 500, gold: 500, items: ["Shadow Monarch's Dagger"] }, completed: false, active: true,
  },
  {
    id: 'story_4', title: 'Shadow Army Commander', description: 'Command 5 shadows in your army.',
    type: 'story',
    objectives: [{ description: 'Shadows extracted', current: 0, target: 5 }],
    rewards: { exp: 800, gold: 600 }, completed: false, active: true,
  },
  {
    id: 'story_5', title: 'The Monarch Awakens', description: 'Reach S-Rank and claim your destiny as a Monarch.',
    type: 'story',
    objectives: [{ description: 'Reach S-Rank (Level 30)', current: 0, target: 1 }],
    rewards: { exp: 2000, gold: 2000, items: ['Monarch Crown'] }, completed: false, active: true,
  },
  // EMERGENCY QUESTS
  {
    id: 'emergency_1', title: 'Red Gate Emergency', description: 'A red gate has appeared! Clear the dungeon before it overflows.',
    type: 'emergency',
    objectives: [{ description: 'Clear the Red Gate dungeon', current: 0, target: 1 }],
    rewards: { exp: 250, gold: 200 }, completed: false, active: false, timeLimit: 3600,
  },
  {
    id: 'emergency_2', title: 'Dungeon Break', description: 'Monsters are pouring out of an unstable gate! Push them back.',
    type: 'emergency',
    objectives: [{ description: 'Monsters eliminated', current: 0, target: 10 }],
    rewards: { exp: 300, gold: 250 }, completed: false, active: false, timeLimit: 1800,
  },
  // PENALTY QUESTS
  {
    id: 'penalty_1', title: 'Penalty Quest: Survival', description: 'WARNING - Failure to complete daily quests has triggered a penalty quest. Survive the Penalty Zone.',
    type: 'penalty',
    objectives: [{ description: 'Survive for 4 hours', current: 0, target: 4 }],
    rewards: { exp: 150, gold: 0 }, completed: false, active: false,
  },
];

const DUNGEONS: DungeonInfo[] = [
  // E-Rank Dungeons (Level 1-4)
  { id: 'dungeon_e1', name: 'Goblin Cave', rank: 'E', recommendedLevel: 1, rewards: { exp: 80, gold: 40, items: ['Goblin Ear', 'Rusty Sword'] }, boss: 'Goblin Chief', cleared: false, floors: 2 },
  { id: 'dungeon_e2', name: 'Wolf Den', rank: 'E', recommendedLevel: 2, rewards: { exp: 100, gold: 55, items: ['Wolf Fang', 'Wolf Pelt'] }, boss: 'Alpha Wolf', cleared: false, floors: 2 },
  { id: 'dungeon_e3', name: 'Rat Sewers', rank: 'E', recommendedLevel: 3, rewards: { exp: 120, gold: 65, items: ['Rat Tail', 'Sewer Key'] }, boss: 'Giant Rat King', cleared: false, floors: 3 },
  { id: 'dungeon_e4', name: 'Spider Nest', rank: 'E', recommendedLevel: 4, rewards: { exp: 140, gold: 75, items: ['Spider Silk', 'Venom Gland'] }, boss: 'Broodmother', cleared: false, floors: 3 },
  // D-Rank Dungeons (Level 5-9)
  { id: 'dungeon_d1', name: 'Undead Crypt', rank: 'D', recommendedLevel: 5, rewards: { exp: 200, gold: 100, items: ['Skeleton Bone', 'Shadow Essence'] }, boss: 'Skeleton Knight', cleared: false, floors: 4 },
  { id: 'dungeon_d2', name: 'Poison Swamp', rank: 'D', recommendedLevel: 6, rewards: { exp: 240, gold: 120, items: ['Venom Sac', 'Antidote Herb'] }, boss: 'Swamp Basilisk', cleared: false, floors: 4 },
  { id: 'dungeon_d3', name: 'Bandit Fortress', rank: 'D', recommendedLevel: 7, rewards: { exp: 280, gold: 150, items: ['Bandit Mask', 'Stolen Gold'] }, boss: 'Bandit Lord', cleared: false, floors: 5 },
  { id: 'dungeon_d4', name: 'Cursed Mine', rank: 'D', recommendedLevel: 8, rewards: { exp: 320, gold: 170, items: ['Cursed Ore', 'Mine Crystal'] }, boss: 'Mine Golem', cleared: false, floors: 5 },
  { id: 'dungeon_d5', name: 'Orc Stronghold', rank: 'D', recommendedLevel: 9, rewards: { exp: 360, gold: 200, items: ['Orc Tusk', 'War Horn'] }, boss: 'Orc Warlord', cleared: false, floors: 5 },
  // C-Rank Dungeons (Level 10-14)
  { id: 'dungeon_c1', name: 'Demon Tower', rank: 'C', recommendedLevel: 10, rewards: { exp: 500, gold: 250, items: ['Demon Horn', 'Fire Crystal'] }, boss: 'Demon Baron', cleared: false, floors: 6 },
  { id: 'dungeon_c2', name: 'Ice Cavern', rank: 'C', recommendedLevel: 11, rewards: { exp: 580, gold: 290, items: ['Frost Core', 'Ice Blade Shard'] }, boss: 'Frost Giant', cleared: false, floors: 6 },
  { id: 'dungeon_c3', name: 'Haunted Cathedral', rank: 'C', recommendedLevel: 12, rewards: { exp: 660, gold: 330, items: ['Spirit Lantern', 'Holy Shard'] }, boss: 'Archbishop Wraith', cleared: false, floors: 7 },
  { id: 'dungeon_c4', name: 'Lava Tunnels', rank: 'C', recommendedLevel: 13, rewards: { exp: 740, gold: 370, items: ['Magma Core', 'Flame Rune'] }, boss: 'Magma Serpent', cleared: false, floors: 7 },
  { id: 'dungeon_c5', name: 'Sunken Ruins', rank: 'C', recommendedLevel: 14, rewards: { exp: 820, gold: 410, items: ['Ancient Coin', 'Trident Shard'] }, boss: 'Sea Hydra', cleared: false, floors: 8 },
  // B-Rank Dungeons (Level 15-19)
  { id: 'dungeon_b1', name: 'Dragon Nest', rank: 'B', recommendedLevel: 15, rewards: { exp: 1100, gold: 550, items: ['Dragon Scale', 'Dragon Fang'] }, boss: 'Young Dragon', cleared: false, floors: 8 },
  { id: 'dungeon_b2', name: 'Dark Elven Citadel', rank: 'B', recommendedLevel: 16, rewards: { exp: 1250, gold: 625, items: ['Elven Crystal', 'Shadow Bow'] }, boss: 'Dark Elf Queen', cleared: false, floors: 9 },
  { id: 'dungeon_b3', name: 'Titan Colosseum', rank: 'B', recommendedLevel: 17, rewards: { exp: 1400, gold: 700, items: ['Titan Fragment', 'Colosseum Token'] }, boss: 'Iron Titan', cleared: false, floors: 9 },
  { id: 'dungeon_b4', name: 'Abyssal Lair', rank: 'B', recommendedLevel: 18, rewards: { exp: 1550, gold: 775, items: ['Abyss Shard', 'Void Essence'] }, boss: 'Abyssal Horror', cleared: false, floors: 10 },
  { id: 'dungeon_b5', name: 'Red Gate', rank: 'B', recommendedLevel: 19, rewards: { exp: 1700, gold: 850, items: ['Red Crystal', 'Infernal Core'] }, boss: 'Infernal Demon', cleared: false, floors: 10 },
  // A-Rank Dungeons (Level 20-29)
  { id: 'dungeon_a1', name: 'Shadow Temple', rank: 'A', recommendedLevel: 20, rewards: { exp: 2200, gold: 1100, items: ['Shadow Fragment', 'Dark Rune'] }, boss: 'Shadow Monarch Phantom', cleared: false, floors: 10 },
  { id: 'dungeon_a2', name: 'Celestial Fortress', rank: 'A', recommendedLevel: 22, rewards: { exp: 2600, gold: 1300, items: ['Angel Feather', 'Holy Sword Shard'] }, boss: 'Fallen Archangel', cleared: false, floors: 12 },
  { id: 'dungeon_a3', name: 'Demon King Castle', rank: 'A', recommendedLevel: 24, rewards: { exp: 3000, gold: 1500, items: ['Demon King Horn', 'Hellfire Crystal'] }, boss: 'Demon King Baran', cleared: false, floors: 12 },
  { id: 'dungeon_a4', name: 'Frost Monarch Tomb', rank: 'A', recommendedLevel: 26, rewards: { exp: 3400, gold: 1700, items: ['Frost Monarch Shard', 'Eternal Ice'] }, boss: 'Frost Monarch', cleared: false, floors: 14 },
  { id: 'dungeon_a5', name: 'Double Dungeon', rank: 'A', recommendedLevel: 28, rewards: { exp: 4000, gold: 2000, items: ['System Fragment', 'Architect Key'] }, boss: 'The Architect', cleared: false, floors: 15 },
  // S-Rank Dungeons (Level 30-39)
  { id: 'dungeon_s1', name: 'Chaos Rift', rank: 'S', recommendedLevel: 30, rewards: { exp: 5000, gold: 2500, items: ['Chaos Crystal', 'Monarch Essence'] }, boss: 'Chaos Beast', cleared: false, floors: 15 },
  { id: 'dungeon_s2', name: 'Beast Monarch Domain', rank: 'S', recommendedLevel: 33, rewards: { exp: 6500, gold: 3250, items: ['Beast Fang', 'Monarch Claw'] }, boss: 'Beast Monarch', cleared: false, floors: 18 },
  { id: 'dungeon_s3', name: 'Plague Monarch Abyss', rank: 'S', recommendedLevel: 36, rewards: { exp: 8000, gold: 4000, items: ['Plague Heart', 'Toxic Crown'] }, boss: 'Plague Monarch', cleared: false, floors: 18 },
  // SS-Rank Dungeons (Level 40-49)
  { id: 'dungeon_ss1', name: 'Monarch War Zone', rank: 'SS', recommendedLevel: 40, rewards: { exp: 12000, gold: 6000, items: ['War Monarch Blade', 'Sovereign Crest'] }, boss: 'Iron Body Monarch', cleared: false, floors: 20 },
  { id: 'dungeon_ss2', name: 'Rulers Dimension', rank: 'SS', recommendedLevel: 45, rewards: { exp: 18000, gold: 9000, items: ['Ruler Fragment', 'Divine Light'] }, boss: 'Fragment of Brilliance', cleared: false, floors: 25 },
  // National-Level Dungeon (Level 50+)
  { id: 'dungeon_nat1', name: 'Gate of the Absolute Being', rank: 'National', recommendedLevel: 50, rewards: { exp: 30000, gold: 15000, items: ['Cup of Reincarnation', 'Absolute Shard'] }, boss: 'The Absolute Being', cleared: false, floors: 30 },
];

const SHOP_ITEMS: ShopItem[] = [
  { id: 'shop_dagger', name: 'Iron Dagger', description: 'A well-crafted iron dagger.', price: 100, type: 'weapon', rarity: 'common', stats: { strength: 5 }, icon: 'Sword' },
  { id: 'shop_sword', name: 'Steel Longsword', description: 'A sturdy steel longsword.', price: 300, type: 'weapon', rarity: 'uncommon', stats: { strength: 12 }, icon: 'Sword' },
  { id: 'shop_knight_blade', name: "Knight's Blade", description: 'A blade used by elite knights.', price: 1000, type: 'weapon', rarity: 'rare', stats: { strength: 25, agility: 5 }, icon: 'Sword' },
  { id: 'shop_demon_sword', name: 'Demon Slayer', description: 'A sword forged to slay demons.', price: 5000, type: 'weapon', rarity: 'epic', stats: { strength: 50, agility: 10 }, icon: 'Sword' },
  { id: 'shop_leather', name: 'Leather Armor', description: 'Light but durable armor.', price: 150, type: 'armor', rarity: 'common', stats: { vitality: 5 }, icon: 'Shield' },
  { id: 'shop_chain', name: 'Chainmail', description: 'Interlocked rings provide good protection.', price: 500, type: 'armor', rarity: 'uncommon', stats: { vitality: 15 }, icon: 'Shield' },
  { id: 'shop_plate', name: 'Knight Plate', description: 'Heavy armor for the toughest battles.', price: 2000, type: 'armor', rarity: 'rare', stats: { vitality: 35, strength: 5 }, icon: 'Shield' },
  { id: 'shop_hp_pot', name: 'HP Potion', description: 'Restores 100 HP.', price: 25, type: 'potion', rarity: 'common', icon: 'Droplet' },
  { id: 'shop_mp_pot', name: 'MP Potion', description: 'Restores 60 MP.', price: 25, type: 'potion', rarity: 'common', icon: 'Sparkles' },
  { id: 'shop_hp_pot_lg', name: 'Greater HP Potion', description: 'Restores 500 HP.', price: 100, type: 'potion', rarity: 'uncommon', icon: 'Droplet' },
  { id: 'shop_str_rune', name: 'Rune of Strength', description: 'Permanently increases STR by 3.', price: 1500, type: 'rune', rarity: 'rare', stats: { strength: 3 }, icon: 'Gem' },
  { id: 'shop_agi_rune', name: 'Rune of Agility', description: 'Permanently increases AGI by 3.', price: 1500, type: 'rune', rarity: 'rare', stats: { agility: 3 }, icon: 'Gem' },
  { id: 'shop_vit_rune', name: 'Rune of Vitality', description: 'Permanently increases VIT by 3.', price: 1500, type: 'rune', rarity: 'rare', stats: { vitality: 3 }, icon: 'Gem' },
];

function calculateExpToNext(level: number): number {
  // Much flatter curve: level 1 = 80, level 10 = 260, level 20 = 460, level 50 = 1060
  return Math.floor(60 + level * 20);
}

function calculateRank(level: number): HunterRank {
  if (level >= 50) return 'National';
  if (level >= 40) return 'SS';
  if (level >= 30) return 'S';
  if (level >= 20) return 'A';
  if (level >= 15) return 'B';
  if (level >= 10) return 'C';
  if (level >= 5) return 'D';
  return 'E';
}

export function createNewPlayer(name: string): PlayerData {
  return {
    name,
    title: 'The Weakest Hunter',
    level: 1,
    exp: 0,
    expToNext: calculateExpToNext(1),
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    gold: 100,
    hunterRank: 'E',
    stats: { strength: 5, agility: 5, vitality: 5, intelligence: 5, perception: 5, availablePoints: 0 },
    skills: [...DEFAULT_SKILLS],
    inventory: DEFAULT_INVENTORY.map(i => ({ ...i })),
    quests: DEFAULT_QUESTS.map(q => ({ ...q, objectives: q.objectives.map(o => ({ ...o })) })),
    shadows: [],
    dungeonHistory: [],
    totalDungeonClears: 0,
    totalMonstersKilled: 0,
    daysActive: 1,
    fatigue: 0,
    maxFatigue: 100,
    jobClass: 'None',
  };
}

export function getDungeons(): DungeonInfo[] {
  return DUNGEONS.map(d => ({ ...d }));
}

export function getShopItems(): ShopItem[] {
  return SHOP_ITEMS.map(s => ({ ...s }));
}

// ===== GAME ACTIONS =====

export function addExp(player: PlayerData, amount: number): PlayerData {
  let p = { ...player, exp: player.exp + amount };
  while (p.exp >= p.expToNext) {
    p.exp -= p.expToNext;
    p.level += 1;
    p.expToNext = calculateExpToNext(p.level);
    p.stats = { ...p.stats, availablePoints: p.stats.availablePoints + 3 };
    p.maxHp += 25;
    p.hp = p.maxHp;
    p.maxMp += 15;
    p.mp = p.maxMp;
    // Bonus gold on level up
    p.gold += p.level * 10;
    p.hunterRank = calculateRank(p.level);
    // Unlock skills
    p.skills = p.skills.map(s =>
      !s.unlocked && s.requiredLevel <= p.level ? { ...s, unlocked: true, level: 1 } : s
    );
    // Update title
    if (p.level >= 30) p.title = 'Shadow Monarch';
    else if (p.level >= 20) p.title = 'Shadow Sovereign';
    else if (p.level >= 15) p.title = 'Shadow Commander';
    else if (p.level >= 10) p.title = 'Rising Hunter';
    else if (p.level >= 5) p.title = 'Awakened Hunter';
    // Job class
    if (p.level >= 15 && p.jobClass === 'None') p.jobClass = 'Shadow Monarch';
  }
  return p;
}

export function allocateStat(player: PlayerData, stat: keyof Omit<PlayerStats, 'availablePoints'>): PlayerData {
  if (player.stats.availablePoints <= 0) return player;
  const newStats = { ...player.stats };
  newStats[stat] += 1;
  newStats.availablePoints -= 1;
  let p = { ...player, stats: newStats };
  if (stat === 'vitality') {
    p.maxHp = 100 + (newStats.vitality - 5) * 10;
    p.hp = Math.min(p.hp, p.maxHp);
  }
  if (stat === 'intelligence') {
    p.maxMp = 50 + (newStats.intelligence - 5) * 5;
    p.mp = Math.min(p.mp, p.maxMp);
  }
  return p;
}

export function completeQuestObjective(player: PlayerData, questId: string, objectiveIndex: number, amount: number = 1): PlayerData {
  const quests = player.quests.map(q => {
    if (q.id !== questId) return q;
    const objectives = q.objectives.map((o, i) => {
      if (i !== objectiveIndex) return o;
      return { ...o, current: Math.min(o.current + amount, o.target) };
    });
    const allComplete = objectives.every(o => o.current >= o.target);
    return { ...q, objectives, completed: allComplete };
  });
  let p = { ...player, quests };
  // Auto-reward completed quests
  const justCompleted = quests.find(q => q.id === questId && q.completed && !player.quests.find(pq => pq.id === questId)?.completed);
  if (justCompleted) {
    p = addExp(p, justCompleted.rewards.exp);
    p.gold += justCompleted.rewards.gold;
  }
  return p;
}

export function clearDungeon(player: PlayerData, dungeon: DungeonInfo): PlayerData {
  // Dungeons are repeatable! First clear gives full rewards, repeats give 60%
  const isFirstClear = !player.dungeonHistory.includes(dungeon.id);
  const expMultiplier = isFirstClear ? 1.0 : 0.6;
  const goldMultiplier = isFirstClear ? 1.0 : 0.6;

  let p = addExp(player, Math.floor(dungeon.rewards.exp * expMultiplier));
  p.gold += Math.floor(dungeon.rewards.gold * goldMultiplier);
  p.totalDungeonClears += 1;
  p.totalMonstersKilled += dungeon.floors * 5;
  // Only add to history if first time
  if (isFirstClear) {
    p.dungeonHistory = [...p.dungeonHistory, dungeon.id];
  }
  // Fatigue: 10 for E/D rank, 15 for C/B, 20 for A+
  const fatigueCost = ['E', 'D'].includes(dungeon.rank) ? 10 : ['C', 'B'].includes(dungeon.rank) ? 15 : 20;
  p.fatigue = Math.min(p.fatigue + fatigueCost, p.maxFatigue);
  // Add loot to inventory
  dungeon.rewards.items.forEach(itemName => {
    const existing = p.inventory.find(i => i.name === itemName);
    if (existing) {
      p.inventory = p.inventory.map(i => i.name === itemName ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      const rankRarity = (r: string) => {
        if (['S', 'SS', 'National'].includes(r)) return 'legendary' as const;
        if (r === 'A') return 'epic' as const;
        if (r === 'B') return 'rare' as const;
        if (['C', 'D'].includes(r)) return 'uncommon' as const;
        return 'common' as const;
      };
      p.inventory = [...p.inventory, {
        id: `loot_${Date.now()}_${Math.random()}`,
        name: itemName,
        description: `Obtained from ${dungeon.name}.`,
        type: 'material' as const,
        rarity: rankRarity(dungeon.rank),
        quantity: 1,
        icon: 'Package',
        sellPrice: Math.floor(dungeon.rewards.gold / 2),
      }];
    }
  });
  return p;
}

export function extractShadow(player: PlayerData, dungeonName: string, bossName: string, rank: HunterRank): PlayerData {
  const shadowNames = ['Igris', 'Tank', 'Iron', 'Jima', 'Beru', 'Tusk', 'Greed', 'Kaisel', 'Bellion', 'Fang'];
  const usedNames = player.shadows.map(s => s.name);
  const availableName = shadowNames.find(n => !usedNames.includes(n)) || `Shadow_${player.shadows.length + 1}`;
  const shadow: Shadow = {
    id: `shadow_${Date.now()}`,
    name: availableName,
    rank,
    level: player.level,
    type: bossName,
    power: player.level * 10 + player.stats.intelligence * 2,
    icon: 'Ghost',
  };
  return { ...player, shadows: [...player.shadows, shadow] };
}

export function buyItem(player: PlayerData, shopItem: ShopItem): PlayerData | null {
  if (player.gold < shopItem.price) return null;
  let p = { ...player, gold: player.gold - shopItem.price };
  // If rune, apply stats permanently
  if (shopItem.type === 'rune' && shopItem.stats) {
    const newStats = { ...p.stats };
    if (shopItem.stats.strength) newStats.strength += shopItem.stats.strength;
    if (shopItem.stats.agility) newStats.agility += shopItem.stats.agility;
    if (shopItem.stats.vitality) newStats.vitality += shopItem.stats.vitality;
    if (shopItem.stats.intelligence) newStats.intelligence += shopItem.stats.intelligence;
    if (shopItem.stats.perception) newStats.perception += shopItem.stats.perception;
    p.stats = newStats;
    return p;
  }
  // Add to inventory
  const existing = p.inventory.find(i => i.name === shopItem.name);
  if (existing) {
    p.inventory = p.inventory.map(i => i.name === shopItem.name ? { ...i, quantity: i.quantity + 1 } : i);
  } else {
    p.inventory = [...p.inventory, {
      id: `inv_${Date.now()}`,
      name: shopItem.name,
      description: shopItem.description,
      type: shopItem.type,
      rarity: shopItem.rarity,
      quantity: 1,
      stats: shopItem.stats,
      icon: shopItem.icon,
      sellPrice: Math.floor(shopItem.price / 2),
    }];
  }
  return p;
}

export function sellItem(player: PlayerData, itemId: string): PlayerData {
  const item = player.inventory.find(i => i.id === itemId);
  if (!item || item.equipped) return player;
  let p = { ...player, gold: player.gold + item.sellPrice };
  if (item.quantity > 1) {
    p.inventory = p.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
  } else {
    p.inventory = p.inventory.filter(i => i.id !== itemId);
  }
  return p;
}

export function equipItem(player: PlayerData, itemId: string): PlayerData {
  const item = player.inventory.find(i => i.id === itemId);
  if (!item || (item.type !== 'weapon' && item.type !== 'armor')) return player;
  // Unequip same type
  const inventory = player.inventory.map(i => {
    if (i.type === item.type && i.equipped) return { ...i, equipped: false };
    if (i.id === itemId) return { ...i, equipped: true };
    return i;
  });
  return { ...player, inventory };
}

export function upgradeSkill(player: PlayerData, skillId: string): PlayerData {
  const skill = player.skills.find(s => s.id === skillId);
  if (!skill || !skill.unlocked || skill.level >= skill.maxLevel) return player;
  const cost = skill.level * 50;
  if (player.gold < cost) return player;
  const skills = player.skills.map(s =>
    s.id === skillId ? { ...s, level: s.level + 1, damage: s.damage ? s.damage + 10 : undefined } : s
  );
  return { ...player, skills, gold: player.gold - cost };
}

export function restPlayer(player: PlayerData): PlayerData {
  return {
    ...player,
    hp: player.maxHp,
    mp: player.maxMp,
    fatigue: 0, // Full rest resets all fatigue
  };
}

export function resetDailyQuests(player: PlayerData): PlayerData {
  const quests = player.quests.map(q =>
    q.type === 'daily' ? { ...q, completed: false, objectives: q.objectives.map(o => ({ ...o, current: 0 })) } : q
  );
  return { ...player, quests, daysActive: player.daysActive + 1 };
}

// ===== STORAGE =====

const STORAGE_KEY = 'solo_leveling_player';
const AUTH_KEY = 'solo_leveling_auth';

export function savePlayer(player: PlayerData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  }
}

export function loadPlayer(): PlayerData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

export function saveAuth(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, username);
  }
}

export function loadAuth(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEY);
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getRankColor(rank: HunterRank): string {
  switch (rank) {
    case 'E': return 'text-gray-400';
    case 'D': return 'text-green-400';
    case 'C': return 'text-blue-400';
    case 'B': return 'text-purple-400';
    case 'A': return 'text-orange-400';
    case 'S': return 'text-red-400';
    case 'SS': return 'text-yellow-400';
    case 'National': return 'text-yellow-300';
    default: return 'text-gray-400';
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'text-gray-400 border-gray-600';
    case 'uncommon': return 'text-green-400 border-green-600';
    case 'rare': return 'text-blue-400 border-blue-600';
    case 'epic': return 'text-purple-400 border-purple-600';
    case 'legendary': return 'text-yellow-400 border-yellow-600';
    default: return 'text-gray-400 border-gray-600';
  }
}

export function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common': return 'bg-gray-900/50';
    case 'uncommon': return 'bg-green-900/20';
    case 'rare': return 'bg-blue-900/20';
    case 'epic': return 'bg-purple-900/20';
    case 'legendary': return 'bg-yellow-900/20';
    default: return 'bg-gray-900/50';
  }
}
