import apiClient from "../api/ApiClient";

/** 
 * Lo que recibe el buscador para mostrar la lista de selección.
 * Ahora name_data y rank_data son strings directos.
 */
export interface CharacterCatalogItem {
  id: number;
  name_data: string;  // Cambiado de MultilangText a string
  image_key: string;
  rank_data: string;  // Cambiado de MultilangText a string
}

export interface MultilangText {
  es: string;
  en: string;
}

/** 
 * El resultado de comparar un atributo. 
 * El "value" también pasa a ser un string simple.
 */
export interface AttributeComparison {
  value: MultilangText; 
  result: 'correct' | 'incorrect' | 'higher' | 'lower';
}

export interface SavedAttempt {
  character_id: number;
  character_name?: string; 
  comparison: {
    race: AttributeComparison;
    rank: AttributeComparison;
    class: AttributeComparison;
    affiliation: AttributeComparison;
  };
}

export interface DleGuessResponse {
  correct: boolean;
  attempts: number;
  comparison: {
    race: AttributeComparison;
    rank: AttributeComparison;
    class: AttributeComparison;
    affiliation: AttributeComparison;
  };
}

export interface DleStatusResponse {
  is_completed: boolean;
  attempts_history: SavedAttempt[];
}

// --- El Servicio ---

const DleService = {
  /**
   * Obtiene el catálogo de personajes.
   */
  getCharactersCatalog: async (): Promise<CharacterCatalogItem[]> => {
    const response = await apiClient.get<CharacterCatalogItem[]>("hunter/daily-challenge/characters");
    return response.data;
  },

  /**
   * Envía el intento de adivinanza.
   */
  submitGuess: async (characterId: number): Promise<DleGuessResponse> => {
    const response = await apiClient.post<DleGuessResponse>(`hunter/daily-challenge/guess/${characterId}`);
    return response.data;
  },

  /**
   * Recupera el estado actual del reto diario.
   */
  getDailyStatus: async (): Promise<DleStatusResponse> => {
    const response = await apiClient.get<DleStatusResponse>("hunter/daily-challenge/status");
    return response.data;
  }
};

export default DleService;