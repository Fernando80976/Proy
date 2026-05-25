import apiClient from "../api/ApiClient";
import { type PlayerProfile } from "../services/StatusService"; // Reutilizamos la interfaz del perfil

export interface DungeonApiItem {
  id: number;
  name: string | { [key: string]: string };
  rank: string;
  min_level: number;
  energy_cost: number;
  max_enemies: number;
  boss_id?: number | null;
}

// Interfaz para la respuesta del descanso (puedes ajustarla según lo que devuelva el back)
export interface RestResponse {
  message: string;
  hp_current: number;
  mp_current: number;
  fatigue: number;
}

export const DungeonService = {
  /**
   * Obtiene el perfil completo del cazador.
   * Reutiliza el endpoint que también usa StatusService para mantener la consistencia.
   */
  getProfile: async (): Promise<PlayerProfile> => {
    const response = await apiClient.get<PlayerProfile>("/hunter/profile");
    return response.data;
  },

  /**
   * Envía la petición de descanso al servidor.
   * El back debería resetear la fatiga y restaurar HP/MP.
   */
  rest: async (): Promise<RestResponse> => {
    const response = await apiClient.post<RestResponse>("/hunter/rest");
    return response.data;
  },

  getDungeons: async (): Promise<DungeonApiItem[]> => {
    const response = await apiClient.get<DungeonApiItem[]>("/dungeons/");
    return response.data;
  }
};