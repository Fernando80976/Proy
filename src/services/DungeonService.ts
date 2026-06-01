import apiClient from "../api/ApiClient";
import { type PlayerProfile } from "../services/StatusService"; 

export interface DungeonApiItem {
  id: number;
  name: string | { [key: string]: string };
  rank: string;
  min_level: number;
  energy_cost: number;
  max_enemies: number;
  boss_id?: number | null;
}


export interface RestResponse {
  message: string;
  hp_current: number;
  mp_current: number;
  fatigue: number;
}

export const DungeonService = {

  getProfile: async (): Promise<PlayerProfile> => {
    const response = await apiClient.get<PlayerProfile>("/hunter/profile");
    return response.data;
  },

  rest: async (): Promise<RestResponse> => {
    const response = await apiClient.post<RestResponse>("/hunter/rest");
    return response.data;
  },

  getDungeons: async (): Promise<DungeonApiItem[]> => {
    const response = await apiClient.get<DungeonApiItem[]>("/dungeons/");
    return response.data;
  }
};