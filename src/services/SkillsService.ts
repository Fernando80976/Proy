import apiClient from "../api/ApiClient";



export interface Skill {
  id: number;
  name: Record<string, string>; // Usamos Record porque en DB es JSONB (multi-idioma)
  description: Record<string, string>;
  mana_cost: number;
  damage_multiplier: number;
  min_level_required: number;
  base_level: number;
  max_level: number;
  cooldown: number;
  created_at: string;

  // Es fundamental para que el Front sepa cuántos SP pedirle al usuario
  base_upgrade_sp_cost: number;
  next_upgrade_cost: number;
  // Campos calculados que añade tu endpoint de FastAPI:
  is_unlocked: boolean;
  current_level: number;
  current_mana_cost: number;
}

export interface UpgradeSkillResponse {
  status: string;   // "success"
  message: string;  // "Habilidad mejorada correctamente"
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
  /**
   * Obtiene todas las habilidades del catálogo con el estado 
   * de desbloqueo para el cazador actual.
   */
  getAllSkills: async (): Promise<Skill[]> => {
    const response = await apiClient.get<Skill[]>("/hunter/skills");
    return response.data;
  },

  /**
   * Mejora una habilidad específica consumiendo Skill Points.
   * Llama al endpoint de FastAPI que ejecuta la lógica atómica.
   */
  upgradeSkill: async (skillId: number): Promise<UpgradeSkillResponse> => {
    // Enviamos el skill_id en el body como espera tu UpgradeSkillSchema
    const response = await apiClient.post<UpgradeSkillResponse>("hunter/upgrade-skill", {
      skill_id: skillId
    });
    return response.data;
  }
};

export default SkillsService;