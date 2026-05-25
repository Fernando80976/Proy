import apiClient from "../api/ApiClient";

export interface MultilangText {
  [key: string]: string;
}

// Representa a un cazador en la lista del ranking
export interface RankingHunter {
  position: number;
  username: string;
  hunter_rank: string; // Ejemplo: "S", "A", "B"
  class: MultilangText;         // Ejemplo: { es: "Shadow Monarch", en: "Shadow Monarch" }
  level: number;
  power_score: number;
  is_npc: boolean;
}

// Representa la respuesta detallada de "mi posición"
export interface MyRankingResponse {
  position: number;
  total_hunters: number;
  username: string;
  hunter_rank: string;
  job: string;
  level: number;
  power_score: number;
  is_npc: boolean;
}

export const rankingService = {
  /**
   * Obtiene la lista completa del ranking global (Jugadores + NPCs)
   */
  getGlobalRanking: async (): Promise<RankingHunter[]> => {
    const response = await apiClient.get<RankingHunter[]>("/ranking/");
    return response.data;
  },

  /**
   * Obtiene la posición específica y estadísticas del usuario logueado
   */
  getMyPosition: async (): Promise<MyRankingResponse> => {
    const response = await apiClient.get<MyRankingResponse>("/ranking/me");
    return response.data;
  }
};