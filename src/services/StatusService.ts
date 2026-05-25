import  apiClient  from "../api/ApiClient";

export interface TranslatedText {
  [key: string]: string; // Por si añades más idiomas en el futuro
}

export interface PlayerProfile {
  id: string;
  username: string;
  rank: string;
  class_name: TranslatedText;
  level: number;
  active_title_id: number | null;
  exp_next_level: number;
  experience: number;
  gold: number;
  hp_max: number;
  hp_current: number;
  mp_max: number;
  mp_current: number;
  fatigue: number;
  fatigue_max: number;
  stat_points: number;
  skill_points: number;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
  updated_at: string;
}

export interface Title {
  id: number;
  name: TranslatedText;
  description: TranslatedText;
  description_effect: TranslatedText; 
  stats_effect: string;        
  effect: number;      
  min_level_required: number;       
  created_at: string;
  is_unlocked: boolean; // <--- Nuevo campo detectado desde el Back
}

export const hunterService = {

  getProfile: async (): Promise<PlayerProfile> => {
    const response = await apiClient.get<PlayerProfile>("/hunter/profile", {
    });
    return response.data;
  },

  updateStats: async (stats: { strength: number; agility: number; vitality: number; intelligence: number; sense: number }) => {
    const response = await apiClient.post("/hunter/update-stats", stats);
    return response.data;
  },

// Ahora devuelve todos los títulos (bloqueados y desbloqueados)
  getAllTitles: async (): Promise<Title[]> => {
    const response = await apiClient.get<Title[]>("/hunter/titles");
    return response.data;
  },

  updateActiveTitle: async (titleId: number) => {
    // Usamos PATCH porque solo modificamos una propiedad del perfil
    const response = await apiClient.patch("/hunter/active-title", { title_id: titleId });
    return response.data;
  }

};