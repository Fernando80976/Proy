import apiClient from "../api/ApiClient";

// 1. ACTUALIZACIÓN DE TIPOS
export interface Item {
  id: number;
  name: { es: string; en: string };
  description: { es: string; en: string };
  type: 'armor' | 'weapon' | 'accessory' | 'potion'; // 'potion' añadido por coherencia
  // IMPORTANTE: Incluimos 'dual_hand' para que React sepa cuándo mostrar el modal
  slot_type: 'head' | 'chest' | 'pants' | 'boots' | 'main_hand' | 'off_hand' | 'accessory' | 'dual_hand';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  stat_type: string;
  stat_value: number;
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

// Datos para la petición de equipar
export interface EquipRequest {
  inventory_id: number;
  // El slot que enviamos al Back SIEMPRE debe ser una columna real de hunter_equipment
  slot: 'head' | 'chest' | 'pants' | 'boots' | 'main_hand' | 'off_hand' | 'accessory';
}

export interface InventoryResponse {
  status: string;
  message: string;
  gold_earned?: number;
  new_balance?: number;
}

// 2. SERVICE OPTIMIZADO
export const inventoryService = {
  
  getInventory: async (): Promise<InventorySlot[]> => {
    const response = await apiClient.get<InventorySlot[]>("/inventory/");
    return response.data;
  },

  getEquipment: async (): Promise<HunterEquipment> => {
    const response = await apiClient.get<HunterEquipment>("/inventory/equipment");
    return response.data;
  },

  /**
   * Equipa un objeto. 
   * Recuerda: si el item.slot_type es 'dual_hand', antes de llamar a esta función,
   * el componente React debe haber decidido si el 'slot' será 'main_hand' u 'off_hand'.
   */
  equipItem: async (data: EquipRequest): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>("/inventory/equip", data);
    return response.data;
  },

  unequipItem: async (slot: keyof HunterEquipment): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>(`/inventory/unequip/${slot}`);
    return response.data;
  },

  /**
   * Vende un objeto y actualiza la economía del jugador.
   */
  sellItem: async (inventoryId: number): Promise<InventoryResponse> => {
    const response = await apiClient.post<InventoryResponse>(`/inventory/sell/${inventoryId}`);
    return response.data;
  }

  // Se elimina discardItem ya que decidimos que no tiene sentido existiendo la venta.
};