import { createSocket } from '../api/WsClient';

export interface BattleSkill {
  id: number;
  name: string | { [key: string]: string };
  mana_cost: number;
  cd: number;
}

export interface BattlePotion {
  inventory_id: number;
  name: string | { [key: string]: string };
  quantity: number;
  stat_type: string;
  stat_value: number;
}

export interface BattleEntity {
  name: string;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  skills?: BattleSkill[];
  potions?: BattlePotion[];
}

export interface BattleState {
  player: BattleEntity;
  enemy: BattleEntity;
  dungeon_id?: number | null;
  dungeon_name?: string | null;
  rewards?: {
    exp: number;
    gold: number;
    leveled_up: boolean;
    new_level: number;
  };
  status: 'active' | 'victory' | 'defeat';
  turn: 'player' | 'enemy';
  round: number;
  log: string[];
}

interface BattleErrorMessage {
  error: string;
}

const isBattleState = (data: unknown): data is BattleState => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const candidate = data as Partial<BattleState>;
  return Boolean(candidate.player && candidate.enemy && candidate.status && candidate.turn);
};

export const BattleService = {
  createConnection: (onMessage: (state: BattleState) => void, dungeonId?: number, onError?: (error: string) => void): WebSocket => {
    
    const qs = dungeonId ? `?dungeon_id=${dungeonId}` : '';
    const ws = createSocket(qs);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as BattleState | BattleErrorMessage;

        if ("error" in data) {
          console.error("ERROR [BATTLE WS]:", data.error);
          onError?.(data.error);
          return;
        }

        if (!isBattleState(data)) {
          console.error("ERROR [SYSTEM]: Mensaje WS de batalla inválido", data);
          return;
        }

        onMessage(data);
      } catch (err) {
        console.error("ERROR [SYSTEM]: Fallo al procesar datos de batalla", err);
      }
    };

    return ws;
  },

  sendAction: (ws: WebSocket | null, action: string, skill_id?: number, dungeon_id?: number, inventory_id?: number) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, skill_id, dungeon_id, inventory_id }));
    }
  }
};