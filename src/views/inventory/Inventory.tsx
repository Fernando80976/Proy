import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, Sword, Shield, Gem, Box, CheckCircle, 
  Trash2, Coins, User, ShieldAlert, Loader2, Info
} from 'lucide-react';
import { inventoryService, type EquipRequest, type HunterEquipment, type EquippedItem } from '../../services/InventoryService';
import PreLoader from '../../components/common/Preloader';

// --- HELPERS DE ESTILO ---
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
    case 'S': return 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
    case 'A': return 'text-purple-400 border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
    case 'B': return 'text-blue-400 border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
    case 'C': return 'text-green-400 border-green-500/40 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
    default: return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
  }
};

const ItemIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  switch (type) {
    case 'weapon': return <Sword className={className} />;
    case 'armor': case 'head': case 'chest': case 'pants': case 'boots': 
      return <Shield className={className} />;
    case 'accessory': return <Gem className={className} />;
    default: return <Box className={className} />;
  }
};

// --- COMPONENTE SLOT DE EQUIPO ---
interface EquipmentSlotProps {
  slot: keyof HunterEquipment;
  label: string;
  item: EquippedItem | null;
  onUnequip: (slot: keyof HunterEquipment) => void;
  isPending: boolean;
}

const EquipmentSlot = ({ slot, label, item, onUnequip, isPending }: EquipmentSlotProps) => {
  const getIconType = () => {
    if (['main_hand', 'off_hand'].includes(slot)) return 'weapon';
    if (['head', 'chest', 'pants', 'boots'].includes(slot)) return 'armor';
    return 'accessory';
  };

  return (
    <div className="flex flex-col items-center gap-1 group">
      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-tighter">{label}</span>
      <button 
        onClick={() => item && !isPending && onUnequip(slot)}
        disabled={isPending}
        className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all relative
          ${item ? getRarityStyles(item.rarity) + ' cursor-pointer hover:scale-110 hover:border-red-500/50' : 'border-white/5 bg-black/40 cursor-default'}`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
        ) : item ? (
          <>
            <ItemIcon type={getIconType()} />
            <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
               <Trash2 className="w-3 h-3 text-white" />
            </div>
          </>
        ) : (
          <div className="w-2 h-2 bg-white/5 rotate-45" />
        )}
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const InventoryPanel = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all');
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
  const [showDualModal, setShowDualModal] = useState(false);

  // Consultas
  const { data: inventory = [], isLoading: loadingInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory
  });

  const { data: equipment, isLoading: loadingEquip } = useQuery({
    queryKey: ['equipment'],
    queryFn: inventoryService.getEquipment
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
  };

  // Mutaciones
  const equipMutation = useMutation({
    mutationFn: (data: EquipRequest) => inventoryService.equipItem(data),
    onSuccess: () => {
      setShowDualModal(false);
      invalidateAll();
    },
    onError: (err) => alert(err || "Error al equipar")
  });

  const unequipMutation = useMutation({
    mutationFn: (slot: keyof HunterEquipment) => inventoryService.unequipItem(slot),
    onSuccess: () => invalidateAll(),
    onError: (err) => alert(err || "Error al desequipar")
  });

  const sellMutation = useMutation({
    mutationFn: (id: number) => inventoryService.sellItem(id),
    onSuccess: () => {
      setSelectedInvId(null);
      invalidateAll();
    },
  });

  const selectedSlot = inventory.find(s => s.id === selectedInvId);

  // Manejador del botón Equipar
  const handleEquipClick = () => {
    if (!selectedSlot) return;

    const { slot_type } = selectedSlot.items;

    // Si es dual_hand, abrimos modal para que el usuario elija
    if (slot_type === 'dual_hand') {
      setShowDualModal(true);
    } else {
      // Si es normal, enviamos directamente
      equipMutation.mutate({ 
        inventory_id: selectedSlot.id, 
        slot: slot_type as EquipRequest['slot']
      });
    }
  };

  if (loadingInv || loadingEquip) return <PreLoader message="Accediendo a la bóveda del sistema..." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in p-4 relative">
      
      {/* MODAL PARA DUAL_HAND */}
      {showDualModal && selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-cyan-500/50 p-6 rounded-lg max-w-sm w-full shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <h3 className="text-cyan-400 font-mono text-sm mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> SELECCIONAR MANO
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Este objeto es versátil. ¿En qué mano deseas equipar <span className="text-white font-bold">"{selectedSlot.items.name.es}"</span>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => equipMutation.mutate({ inventory_id: selectedSlot.id, slot: 'main_hand' })}
                disabled={equipMutation.isPending}
                className="bg-cyan-900/50 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 py-2 rounded font-mono text-[10px] uppercase transition-all"
              >
                Mano Principal
              </button>
              <button 
                onClick={() => equipMutation.mutate({ inventory_id: selectedSlot.id, slot: 'off_hand' })}
                disabled={equipMutation.isPending}
                className="bg-cyan-900/50 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 py-2 rounded font-mono text-[10px] uppercase transition-all"
              >
                Mano Secundaria
              </button>
              <button 
                onClick={() => setShowDualModal(false)}
                className="col-span-2 text-slate-500 hover:text-white text-[9px] uppercase mt-2 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN IZQUIERDA: MOCHILA */}
      <div className="lg:col-span-5 system-panel rounded-lg p-5 bg-black/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono text-cyan-400 tracking-tighter flex items-center gap-2">
            <Package className="w-4 h-4" /> MOCHILA
          </h2>
          <div className="flex gap-1">
            {(['all', 'weapon', 'armor', 'accessory'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} 
                className={`px-2 py-0.5 rounded text-[9px] border font-mono uppercase transition-all
                ${filter === f ? 'bg-cyan-500 text-black border-cyan-500' : 'border-white/10 text-muted-foreground hover:border-white/30'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {inventory.filter(s => filter === 'all' || s.items.type === filter).map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedInvId(slot.id)}
              className={`relative aspect-square rounded border-2 flex items-center justify-center transition-all 
                ${getRarityStyles(slot.items.rarity)} 
                ${selectedInvId === slot.id ? 'ring-2 ring-white scale-95 shadow-lg' : 'hover:brightness-125'}`}
            >
              <ItemIcon type={slot.items.type} />
              {equipment && Object.values(equipment).some((e) => e?.inventory_id === slot.id) && (
                <div className="absolute top-0.5 right-0.5 bg-cyan-500 rounded-full p-0.5 shadow-sm">
                  <CheckCircle className="w-2 h-2 text-black" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN CENTRAL: AVATAR */}
      <div className="lg:col-span-4 system-panel rounded-lg p-5 bg-black/60 border border-white/10 flex flex-col items-center min-h-[400px]">
        <h2 className="text-sm font-mono text-purple-400 mb-8 uppercase tracking-widest flex items-center gap-2">
          <User className="w-4 h-4" /> AVATAR
        </h2>
        
        <div className="relative w-full max-w-[220px] aspect-[3/4] flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <User className="w-48 h-48 text-white" />
          </div>

          <div className="z-10 grid grid-cols-3 gap-x-10 gap-y-6 w-full h-full">
            <div className="col-start-2 justify-self-center">
               <EquipmentSlot slot="head" label="Cabeza" item={equipment?.head ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-1 row-start-2">
               <EquipmentSlot slot="main_hand" label="Mano P." item={equipment?.main_hand ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-2 row-start-2">
               <EquipmentSlot slot="chest" label="Pecho" item={equipment?.chest ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-3 row-start-2">
               <EquipmentSlot slot="off_hand" label="Mano S." item={equipment?.off_hand ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-2 row-start-3">
               <EquipmentSlot slot="pants" label="Piernas" item={equipment?.pants ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-1 row-start-4">
               <EquipmentSlot slot="accessory" label="Accesorio" item={equipment?.accessory ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
            <div className="col-start-2 row-start-4">
               <EquipmentSlot slot="boots" label="Pies" item={equipment?.boots ?? null} onUnequip={(s) => unequipMutation.mutate(s)} isPending={unequipMutation.isPending} />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: DETALLES */}
      <div className="lg:col-span-3">
        {selectedSlot ? (
          <div className="rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/5 animate-in slide-in-from-right-4 duration-300 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded border-2 ${getRarityStyles(selectedSlot.items.rarity)}`}>
                <ItemIcon type={selectedSlot.items.type} className="w-6 h-6" />
              </div>
              <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded ${getRarityStyles(selectedSlot.items.rarity)}`}>
                {selectedSlot.items.rarity.toUpperCase()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white uppercase mb-1">{selectedSlot.items.name.es}</h3>
            <p className="text-[10px] text-slate-400 italic mb-4 leading-relaxed">
              "{selectedSlot.items.description?.es || "Objeto de origen desconocido encontrado en una mazmorra."}"
            </p>

            <div className="bg-black/40 p-3 rounded border border-white/5 mb-4 shadow-inner">
              <p className="text-[8px] font-mono text-cyan-400 uppercase mb-1">Efectos del Objeto:</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white">+{selectedSlot.items.stat_value} {selectedSlot.items.stat_type.toUpperCase()}</span>
                <span className="text-[8px] text-slate-500 font-mono italic">Slot: {selectedSlot.items.slot_type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleEquipClick}
                disabled={equipMutation.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black text-[10px] font-bold py-2 rounded uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                {equipMutation.isPending ? "Procesando..." : "Equipar Objeto"}
              </button>
              
              <button 
                onClick={() => sellMutation.mutate(selectedSlot.id)}
                disabled={sellMutation.isPending}
                className="w-full bg-amber-500/5 hover:bg-amber-500 hover:text-black text-amber-500 border border-amber-500/20 py-2 rounded text-[9px] font-mono uppercase transition-all flex items-center justify-center gap-2"
              >
                Vender por {Math.floor(selectedSlot.items.price * 0.5)} <Coins className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-black/20 min-h-[300px]">
            <ShieldAlert className="w-10 h-10 text-white/5 mb-3" />
            <p className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed max-w-[150px]">
              Analizador de sistema esperando selección de objeto...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;