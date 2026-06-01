import apiClient from "../api/ApiClient";

export interface TranslatedText {
  [key: string]: string; 
}

export interface Skill {
  id: number;
  name: TranslatedText;
  description: TranslatedText;
  mana_cost: number;
  damage_multiplier: number;
  min_level_required: number;
  base_level: number;
  max_level: number;
  cooldown: number;
  created_at: string;

  
  base_upgrade_sp_cost: number;
  next_upgrade_cost: number;
  
  is_unlocked: boolean;
  current_level: number;
  current_mana_cost: number;
}

export interface UpgradeSkillResponse {
  status: string;   
  message: string;  
  skill_data: {
    new_level: number;
    updated_mana_cost: number;
    remaining_skill_points: number;
    spent_skill_points: number;
  }; 
}

export interface UpgradeSkillData {
  skill_id: number;
}

const SkillsService = {
  
  getAllSkills: async (): Promise<Skill[]> => {
    const response = await apiClient.get<Skill[]>("/hunter/skills");
    return response.data;
  },


  upgradeSkill: async (skillId: number): Promise<UpgradeSkillResponse> => {
    
    const response = await apiClient.post<UpgradeSkillResponse>("hunter/upgrade-skill", {
      skill_id: skillId
    });
    return response.data;
  }
};

export default SkillsService;