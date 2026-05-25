import apiClient from "../api/ApiClient";

// 1. Define la estructura de los items de recompensa
export interface RewardItem {
  item_id: number;
  quantity: number;
}

// 2. Definimos la interfaz para tener tipado fuerte en React
export interface Mission {
  instance_id: number;
  mission_id: number;
  current_progress: number;
  status: 'active' | 'completed' | 'claimed';
  started_at: string;
  completed_at: string | null;
  
  // Datos del catálogo (ya aplanados)
  title: { [key: string]: string }; // Soporta {"es": "...", "en": "..."}
  description: { [key: string]: string };
  mission_type: 'daily' | 'story' | 'achievement' | 'emergency' | 'penalty';
  target_type: 'kill' | 'stat_reach' | 'complete_dungeon' | 'training' | 'dle_guess';
  target_value: number;
  reward_exp: number;
  reward_gold: number;
  reward_items: RewardItem[] | null;
}

// Define lo que devuelve el servidor al actualizar progreso
export interface ProgressUpdateResponse {
  status: string;
  new_progress: number;
  is_completed: boolean;
}

const QuestService = {
  getMyMissions: async (): Promise<Mission[]> => {
    const response = await apiClient.get<Mission[]>("/hunter/missions");
    return response.data;
  },

updateProgress: async (instanceId: number, increment: number = 1, completeMax: boolean = false): Promise<ProgressUpdateResponse> => {
  const response = await apiClient.patch<ProgressUpdateResponse>(
    `/hunter/missions/${instanceId}/progress`, 
    null, 
    { params: { increment, complete_max: completeMax } } // Pasamos el booleano
  );
  return response.data;
},

  claimReward: async (instanceId: number) => {
    const response = await apiClient.post(`/hunter/missions/${instanceId}/claim`);
    return response.data;
  }
};

export default QuestService;