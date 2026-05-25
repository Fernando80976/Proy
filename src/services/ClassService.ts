import apiClient from "../api/ApiClient";

export interface TranslatedText {
  es: string;
  en: string;
  [key: string]: string; // Por si añades más idiomas en el futuro
}

export interface PlayerClass {
  id: number;
  name: TranslatedText;           // Nombre de la clase
  description: TranslatedText;
  description_effect: TranslatedText;      // Usamos any o un record porque es JSONB (traducciones)
  stats_bonus: number;   // El valor que suma
  target_stat: string;   // A qué stat afecta (strength, agility, etc.)
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
  /**
   * Obtiene la lista de clases disponibles desde el backend.
   * Útil para pintar la pantalla de selección de clase.
   */
  getClasses: async (): Promise<PlayerClass[]> => {
    const response = await apiClient.get<PlayerClass[]>("/hunter/classes");
    return response.data;
  },

  /**
   * Envía la elección del jugador al backend.
   * @param data Objeto con el ID de la clase elegida { class_id: 1 }
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