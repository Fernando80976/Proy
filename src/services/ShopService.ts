import apiCliente from "../api/ApiClient";
import axios from "axios";

export interface ShopItem {
  id: number;
  name: { [key: string]: string }; // JSONB para multi-idioma (ej: { "es": "Espada", "en": "Sword" })
  description: { [key: string]: string };
  type: 'armor' | 'weapon' | 'accessory';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  stat_type: string;
  stat_value: number;
  created_at: string;
}

export interface PurchaseResponse {
  status: string;
  message: string;
  item_id: number;
  gold_spent: number;
  gold_remaining: number;
}

const ShopService = {
  /**
   * Obtiene la lista de todos los objetos disponibles en la tienda.
   */
  async getAllItems(): Promise<ShopItem[]> {
    try {
      const response = await apiCliente.get<ShopItem[]>("/shop/items");
      return response.data;
    } catch (error) {
      console.error("Error al obtener items de la tienda:", error);
      throw error;
    }
  },

  /**
   * Realiza la compra de un objeto por su ID.
   * El ID del usuario no se envía por parámetro porque el backend 
   * lo extrae del token mediante 'validate_hunter_session'.
   */
  async buyItem(itemId: number): Promise<PurchaseResponse> {
    try {
      const response = await apiCliente.post<PurchaseResponse>(`/shop/buy/${itemId}`);
      return response.data;
    } catch (error) {
      // Aquí capturamos los errores 400 y 404 que definiste en FastAPI
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.detail || "Error en la compra";
            console.error("Error al comprar item:", errorMessage);
            throw new Error(errorMessage);
        }else {
            console.error("Error desconocido al comprar item:", error);
            throw error;
        }
    }
  }
};

export default ShopService;