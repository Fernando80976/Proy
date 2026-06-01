import  apiClient  from "../api/ApiClient";

export interface TranslatedText {
  [key: string]: string;
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
  
  
  base_strength: number;
  bonus_strength: number;
  title_bonus_strength: number;
  class_bonus_strength: number;

  base_agility: number;
  bonus_agility: number;
  title_bonus_agility: number;
  class_bonus_agility: number;

  base_vitality: number;
  bonus_vitality: number;
  title_bonus_vitality: number;
  class_bonus_vitality: number;

  base_intelligence: number;
  bonus_intelligence: number;
  title_bonus_intelligence: number;
  class_bonus_intelligence: number;

  base_sense: number;
  bonus_sense: number;
  title_bonus_sense: number;
  class_bonus_sense: number;

  
  base_hp_max: number;
  bonus_hp_max: number;
  base_mp_max: number;
  bonus_mp_max: number;

  has_completed_tutorial: boolean;
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
  is_unlocked: boolean;
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


  getAllTitles: async (): Promise<Title[]> => {
    const response = await apiClient.get<Title[]>("/hunter/titles");
    return response.data;
  },

  updateActiveTitle: async (titleId: number) => {

    const response = await apiClient.patch("/hunter/active-title", { title_id: titleId });
    return response.data;
  },

  markTutorialComplete: async () => {
    const response = await apiClient.patch("/hunter/tutorial-complete");
    return response.data;
  }

};