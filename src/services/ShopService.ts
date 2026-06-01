import apiCliente from "../api/ApiClient";
import axios from "axios";

export interface ShopItem {
  id: number;
  name: { [key: string]: string }; 
  description: { [key: string]: string };
  type: 'armor' | 'weapon' | 'accessory' | 'potion';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  stat_type: string;
  stat_value: number;
  image_key: string | null; 
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
  
  async getAllItems(): Promise<ShopItem[]> {
    try {
      const response = await apiCliente.get<ShopItem[]>("/shop/items");
      return response.data;
    } catch (error) {
      console.error("Error al obtener items de la tienda:", error);
      throw error;
    }
  },

  
  async buyItem(itemId: number): Promise<PurchaseResponse> {
    try {
      const response = await apiCliente.post<PurchaseResponse>(`/shop/buy/${itemId}`);
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.detail || "Error en la compra";
            console.error("Error al comprar item:", errorMessage);
            throw new Error(errorMessage);
        } else {
            console.error("Error desconocido al comprar item:", error);
            throw error;
        }
    }
  }
};

export default ShopService;