import apiClient from "../api/ApiClient";

export interface MultilangText {
  [key: string]: string;
}


export interface RankingHunter {
  position: number;
  username: string;
  hunter_rank: string; 
  class: MultilangText;
  level: number;
  power_score: number;
  is_npc: boolean;
}


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

  getGlobalRanking: async (): Promise<RankingHunter[]> => {
    const response = await apiClient.get<RankingHunter[]>("/ranking/");
    return response.data;
  },


  getMyPosition: async (): Promise<MyRankingResponse> => {
    const response = await apiClient.get<MyRankingResponse>("/ranking/me");
    return response.data;
  }
};