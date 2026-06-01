import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Box, CheckCircle,
  Trash2, Coins, User, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as GiIcons from 'react-icons/gi';
import { inventoryService, type EquipRequest, type HunterEquipment, type EquippedItem } from '../../services/InventoryService';
import PreLoader from '../../components/common/Preloader';
import { GiPerson } from 'react-icons/gi';
import { toastNotification } from '../../components/common/ToastNotification';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { type BackendErrorKey } from '../../types/TranslationsTypes';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

const mapRarity = (rarity: string) => {
  switch (rarity) {
    case 'Legendary': return 'S';
    case 'Epic': return 'A';
    case 'Rare': return 'B';
    default: return 'C';
  }
};

const getRarityStyles = (rarity?: string) => {
  if (!rarity) return 'border-white/5 bg-white/5 text-white/20';
  const rank = mapRarity(rarity);
  switch (rank) {
    case 'S': return 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]';
    case 'A': return 'text-purple-400 border-purple-500/40 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]';
    case 'B': return 'text-blue-400 border-blue-500/40 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
    case 'C': return 'text-green-400 border-green-500/40 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]';
    default: return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
  }
};

const ItemIcon = ({ imageKey, className = "w-6 h-6" }: { imageKey?: string; className?: string }) => {
  if (!imageKey) return <Box className={className} />;
  if (imageKey in GiIcons) {
    const IconComponent = GiIcons[imageKey as keyof typeof GiIcons];
    return <IconComponent className={className} />;
  }
  return <Box className={className} />;
};


interface EquipmentSlotProps {
  slot: keyof HunterEquipment;
  label: string;
  item: EquippedItem | null;
  onUnequip: (slot: keyof HunterEquipment) => void;
  isPending: boolean;
}

const EquipmentSlot = ({ slot, label, item, onUnequip, isPending }: EquipmentSlotProps) => {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
      <button
        onClick={() => item && !isPending && onUnequip(slot)}
        disabled={isPending}
        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all relative backdrop-blur-sm
          ${item ? getRarityStyles(item.rarity) + ' cursor-pointer hover:scale-105 hover:border-red-500/60' : 'border-white/10 bg-black/60 cursor-default shadow-inner'}`}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
        ) : item ? (
          <>
            <ItemIcon imageKey={item.image_key} className="w-8 h-8" />
            <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
              <Trash2 className="w-4 h-4 text-white drop-shadow" />
            </div>
          </>
        ) : (
          <div className="w-2 h-2 bg-white/10 rotate-45" />
        )}
      </button>
    </div>
  );
};


const InventoryPanel = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'accessory' | 'potion'>('all');
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);

  const { t } = useTranslation();

  const { data: inventory = [], isLoading: loadingInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory
  });

  const { data: equipment, isLoading: loadingEquip } = useQuery({
    queryKey: ['equipment'],
    queryFn: inventoryService.getEquipment
  });

  const sortedInventory = useMemo(() => {
    if (!inventory) return [];
    const equippedIds = equipment ? Object.values(equipment).map(e => e?.inventory_id) : [];
    return [...inventory].sort((a, b) => {
      const aIsEquipped = equippedIds.includes(a.id);
      const bIsEquipped = equippedIds.includes(b.id);
      if (aIsEquipped && !bIsEquipped) return -1;
      if (!aIsEquipped && bIsEquipped) return 1;
      return 0;
    });
  }, [inventory, equipment]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
  };

  const equipMutation = useMutation({
    mutationFn: (data: EquipRequest) => inventoryService.equipItem(data),
    onSuccess: () => {
      setSelectedInvId(null);
      invalidateAll();
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      alert(error?.response?.data?.message || error?.message || t('inventory.equip_error'));
    }
  });

  const unequipMutation = useMutation({
    mutationFn: (slot: keyof HunterEquipment) => inventoryService.unequipItem(slot),
    onSuccess: () => invalidateAll(),
    onError: (err: unknown) => {
      const error = err as ApiError;
      alert(error?.response?.data?.message || error?.message || t('inventory.unequip_error'));
    }
  });

  const sellMutation = useMutation({
    mutationFn: (id: number) => inventoryService.sellItem(id),
    onSuccess: () => {
      setSelectedInvId(null);
      invalidateAll();
    },
  });

const usePotionMutation = useMutation({
  mutationFn: (inventoryId: number) => inventoryService.usePotion(inventoryId),
  onSuccess: () => {
    setSelectedInvId(null);
    invalidateAll();
  },
  onError: (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const errorCode: BackendErrorKey = err.response?.data?.mensaje || err.response?.data?.detail;
      toastNotification.error(
        t('inventory.use_potion_error'),
        `${t(`backend_errors.${errorCode}`)}`
      );
    } else {
      toastNotification.error(
        t('inventory.use_potion_error'),
        `${t('backend_errors.ERR_INTERNAL_SYSTEM')}`
      );
    }
  }
});

  const selectedSlot = inventory.find(s => s.id === selectedInvId);

  const selectedSlotEquippedSlot = useMemo<keyof HunterEquipment | null>(() => {
    if (!selectedSlot || !equipment) return null;
    const found = Object.entries(equipment).find(([, eq]) => eq?.inventory_id === selectedSlot.id);
    return found ? (found[0] as keyof HunterEquipment) : null;
  }, [selectedSlot, equipment]);

  const selectedSlotIsEquipped = Boolean(selectedSlotEquippedSlot);

  const selectedSlotOtherHand = selectedSlot?.items.slot_type === 'either_hand' && selectedSlotEquippedSlot
    ? (selectedSlotEquippedSlot === 'main_hand' ? 'off_hand' : 'main_hand')
    : null;

  if (loadingInv || loadingEquip){
    return (
      <div className="min-h-170 bg-background flex items-center justify-center p-6">
        <PreLoader message={t('inventory.loading_vault')} />
      </div>
    ); 
  } 

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5 animate-fade-in relative">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="system-panel rounded-xl p-6 bg-black/70 border border-cyan-500/20 backdrop-blur-md flex flex-col h-[660px]">
          <div className="flex flex-col gap-3 mb-5 shrink-0">
            <h2 className="text-lg font-mono text-cyan-400 tracking-wider flex items-center gap-2 font-bold">
              <Package className="w-6 h-6 text-cyan-400 animate-pulse" /> {t('inventory.backpack_title')}
            </h2>

            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'weapon', 'armor', 'accessory', 'potion'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded text-sm border font-data uppercase transition-all tracking-tight
                  ${filter === f ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'border-white/10 text-muted-foreground hover:border-white/30 hover:text-white'}`}>
                  {t(`inventory.filter_${f}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] auto-rows-max gap-3.5">
            {sortedInventory.filter(s => filter === 'all' || s.items.type === filter).map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedInvId(slot.id)}
                className={`relative w-20 h-20 mt-2 rounded-lg border-2 flex items-center justify-center transition-all bg-black/40 mx-auto
                  ${getRarityStyles(slot.items.rarity)}
                  ${selectedInvId === slot.id ? 'ring-2 ring-cyan-400 scale-95 shadow-lg border-white' : 'hover:brightness-125 hover:scale-105'}`}
              >
                <ItemIcon imageKey={slot.items.image_key} className="w-10 h-10" />

                {slot.quantity && slot.quantity > 1 && (
                  <div className="absolute bottom-1 right-1 bg-system-glow/30 border border-cyan-500/40 rounded px-1.5 h-5 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.25)] pointer-events-none select-none z-10">
                    <span className="text-[10px] font-mono text-cyan-300 font-black tracking-tight leading-none">
                      {slot.quantity}
                    </span>
                  </div>
                )}

                {equipment && Object.values(equipment).some((e) => e?.inventory_id === slot.id) && (
                  <div className="absolute top-1 left-1 bg-cyan-500 rounded-full p-0.5 shadow-md">
                    <CheckCircle className="w-2.5 h-2.5 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="system-panel rounded-xl p-6 bg-black/70 border border-purple-500/20 backdrop-blur-md flex flex-col items-center h-[660px] justify-between">
          <h2 className="text-lg font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2 font-bold shrink-0">
            <User className="w-6 h-6 text-purple-400" /> {t('inventory.equipment_title')}
          </h2>

          <div className="relative w-full max-w-[400px] aspect-[3/4] flex items-center justify-center my-auto">
            <div className="absolute bottom-8 inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <GiPerson  className="w-99 h-99 text-purple-500" />
            </div>

            <div className="z-10 grid grid-cols-3 gap-x-18 gap-y-5 w-full h-full content-center">
              <div className="col-start-2 justify-self-center">
                <EquipmentSlot slot="head" label={t('inventory.slot_head')} item={equipment?.head ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-1 row-start-2 justify-self-start">
                <EquipmentSlot slot="main_hand" label={t('inventory.slot_main_hand')} item={equipment?.main_hand ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-2 row-start-2 justify-self-center">
                <EquipmentSlot slot="chest" label={t('inventory.slot_chest')} item={equipment?.chest ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-3 row-start-2 justify-self-end">
                <EquipmentSlot slot="off_hand" label={t('inventory.slot_off_hand')} item={equipment?.off_hand ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-2 row-start-3 justify-self-center">
                <EquipmentSlot slot="pants" label={t('inventory.slot_pants')} item={equipment?.pants ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-1 row-start-4 justify-self-start">
                <EquipmentSlot slot="accessory" label={t('inventory.slot_accessory')} item={equipment?.accessory ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
              <div className="col-start-2 row-start-4 justify-self-center">
                <EquipmentSlot slot="boots" label={t('inventory.slot_boots')} item={equipment?.boots ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setSelectedInvId(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-xl p-6 system-panel flex flex-col justify-between z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedInvId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex justify-between items-start mb-5 pr-6">
                  <div className={`p-3 rounded-lg border-2 bg-black/40 ${getRarityStyles(selectedSlot.items.rarity)}`}>
                    <ItemIcon imageKey={selectedSlot.items.image_key} className="w-8 h-8" />
                  </div>
                  <span className={`text-[11px] font-mono font-bold border-2 px-3 py-1 rounded-md tracking-wider uppercase ${getRarityStyles(selectedSlot.items.rarity)}`}>
                    {t('inventory.rank_label')} {mapRarity(selectedSlot.items.rarity)}
                  </span>
                </div>

                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wide border-b border-white/10 pb-2 mb-3">
                  {selectedSlot.items.name.es}
                </h3>
                <p className="text-xs text-slate-300 italic mb-6 leading-relaxed bg-black/50 p-3 rounded-lg border border-white/5">
                  "{selectedSlot.items.description?.es || t('inventory.unknown_item')}"
                </p>

                <div className="bg-cyan-950/30 p-4 rounded-lg border border-cyan-500/20 shadow-inner space-y-2 mb-6">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">{t('inventory.item_effects')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-cyan-100 font-bold">
                      +{selectedSlot.items.stat_value} {selectedSlot.items.stat_type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                      {t('inventory.slot_label')}: {selectedSlot.items.slot_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 shrink-0">
                {selectedSlot.items.type === 'potion' ? (
                  <button
                    onClick={() => usePotionMutation.mutate(selectedSlot.id)}
                    disabled={usePotionMutation.isPending}
                    className="w-full bg-green-500 hover:bg-green-400 text-black text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 raw-btn"
                  >
                    {usePotionMutation.isPending ? t('inventory.consuming') : t('inventory.use_potion')}
                  </button>
                ) : selectedSlotIsEquipped ? (
                  <>
                    <button
                      onClick={() => selectedSlotEquippedSlot && unequipMutation.mutate(selectedSlotEquippedSlot)}
                      disabled={unequipMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                      {unequipMutation.isPending
                        ? t('inventory.unequipping')
                        : selectedSlot.items.slot_type === 'either_hand'
                          ? selectedSlotEquippedSlot === 'off_hand'
                            ? t('inventory.unequip_off_hand')
                            : t('inventory.unequip_main_hand')
                          : t('inventory.unequip_item')}
                    </button>

                    {selectedSlotOtherHand && (
                      <button
                        onClick={() => equipMutation.mutate({
                          inventory_id: selectedSlot.id,
                          slot: selectedSlotOtherHand
                        })}
                        disabled={equipMutation.isPending}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        {equipMutation.isPending
                          ? t('inventory.loading_sync')
                          : selectedSlotOtherHand === 'main_hand'
                            ? t('inventory.equip_main_hand')
                            : t('inventory.equip_off_hand')}
                      </button>
                    )}
                  </>
                ) : selectedSlot.items.slot_type === 'either_hand' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => equipMutation.mutate({ inventory_id: selectedSlot.id, slot: 'main_hand' })}
                      disabled={equipMutation.isPending}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      {t('inventory.main_hand')}
                    </button>
                    <button
                      onClick={() => equipMutation.mutate({ inventory_id: selectedSlot.id, slot: 'off_hand' })}
                      disabled={equipMutation.isPending}
                      className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all border border-white/10"
                    >
                      {t('inventory.off_hand')}
                    </button>
                  </div>
                ) : selectedSlot.items.slot_type === 'dual_hand' ? (
                  <button
                    onClick={() => equipMutation.mutate({ inventory_id: selectedSlot.id, slot: 'main_hand' })}
                    disabled={equipMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                  >
                    {t('inventory.equip_both_hands')}
                  </button>
                ) : (
                  <button
                    onClick={() => equipMutation.mutate({
                      inventory_id: selectedSlot.id,
                      slot: selectedSlot.items.slot_type as EquipRequest['slot']
                    })}
                    disabled={equipMutation.isPending}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-bold py-3 rounded-lg uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {equipMutation.isPending ? t('inventory.loading_sync') : t('inventory.equip_item')}
                  </button>
                )}

                <button
                  onClick={() => sellMutation.mutate(selectedSlot.id)}
                  disabled={sellMutation.isPending}
                  className="w-full bg-amber-500/5 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 py-2.5 rounded-lg text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 font-bold"
                >
                  {t('inventory.sell_for')} {Math.floor(selectedSlot.items.price * 0.5)} <Coins className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPanel;