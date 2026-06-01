import apiClient from "../api/ApiClient";

// 1. ACTUALIZACIÓN DE TIPOS
export interface Item {
  id: number;
  name: { es: string; en: string };
  description: { es: string; en: string };
  type: 'armor' | 'weapon' | 'accessory' | 'potion'; 
  slot_type: 'head' | 'chest' | 'pants' | 'boots' | 'main_hand' | 'off_hand' | 'accessory' | 'dual_hand' | 'either_hand';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  stat_type: string;
  stat_value: number;
  image_key: string; // Corregido: nombre unificado y cambiado de Text a string
}

export interface UsePotionResponse {
  status: 'success' | 'error';
  message: string;
  potion_type: string; 
  amount_restored: number;
  hunter_stats: {
    health?: number;
    mana?: number;
    fatigue?: number;
  };
}

export interface InventorySlot {
  id: number;
  quantity: number;
  items: Item;
}

export interface EquippedItem {
  inventory_id: number;
  item_id: number;
  name: { es: string; en: string };
  type: string;
  slot_type: string;
  rarity: string;
  stat_type: string;
  stat_value: number;
  image_key: string; 
}

export interface HunterEquipment {
  head: EquippedItem | null;
  chest: EquippedItem | null;
  pants: EquippedItem | null;
  boots: EquippedItem | null;
  main_hand: EquippedItem | null;
  off_hand: EquippedItem | null;
  accessory: EquippedItem | null;
}

export interface EquipRequest {
  inventory_id: number;
  slot: 'head' | 'chest' | 'pants' | 'boots' | 'main_hand' | 'off_hand' | 'accessory';
}

export interface InventoryResponse {
  status: string;
  message: string;
  gold_earned?: number;
  new_balance?: number;
}


export const inventoryService = {
  getInventory: async (): Promise<InventorySlot[]> => {
    const response = await apiClient.get<InventorySlot[]>("/inventory/");
    return response.data;
  },

  getEquipment: async (): Promise<HunterEquipment> => {
    const response = await apiClient.get<HunterEquipment>("/inventory/equipment");
    return response.data;
  },

  equipItem: async (data: EquipRequest): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>("/inventory/equip", data);
    return response.data;
  },

  unequipItem: async (slot: keyof HunterEquipment): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>(`/inventory/unequip/${slot}`);
    return response.data;
  },

  sellItem: async (inventoryId: number): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>(`/inventory/sell/${inventoryId}`);
    return response.data;
  },

  usePotion: async (inventoryId: number): Promise<UsePotionResponse> => {
    const response = await apiClient.post<UsePotionResponse>(`/inventory/use_potion/${inventoryId}`);
    return response.data;
  }
};