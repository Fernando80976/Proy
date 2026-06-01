import apiClient from "../api/ApiClient";

export interface TranslatedText {
  es: string;
  en: string;
  [key: string]: string;
}

export interface PlayerClass {
  id: number;
  name: TranslatedText; 
  description: TranslatedText;
  description_effect: TranslatedText;
  stats_bonus: number;   
  target_stat: string;   
}

export interface ClassSelectionResponse {
  status: string;
  message: string;
  class_name?: string;
  bonus_applied?: string;
}

export interface SelectClassData {
  class_id: number;
}

export interface checkClassResponse {
  has_class: boolean;
}

export const classService = {
  
  getClasses: async (): Promise<PlayerClass[]> => {
    const response = await apiClient.get<PlayerClass[]>("/hunter/classes");
    return response.data;
  },

  /**
   * @param data
   */
  selectClass: async (data: SelectClassData): Promise<ClassSelectionResponse> => {
    const response = await apiClient.post<ClassSelectionResponse>("/hunter/select-class", data);
    return response.data;
  },

  verifyClass: async(): Promise<boolean> => {  
    const response = await apiClient.get<checkClassResponse>('/hunter/check-class');
    return response.data.has_class;
    }
};