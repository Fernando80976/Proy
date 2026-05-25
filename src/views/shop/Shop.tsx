import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingBag, Coins, Sword, Shield, Droplet, Gem, Box, ShoppingCart, Loader2, LayoutGrid, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Servicios y Contextos del proyecto
import ShopService, { type ShopItem } from '../../services/ShopService';
import { hunterService } from '../../services/StatusService';
import PreLoader from '../../components/common/Preloader';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';
import { toastNotification } from '../../components/common/ToastNotification';

type FilterOption = 'all' | 'weapon' | 'armor' | 'accessory';

const ITEMS_PER_PAGE = 6; // Cantidad ideal para mantener controlada la UI

const getRarityDesign = (rarity: string) => {
  switch (rarity.toUpperCase()) {
    case 'LEGENDARY': case 'S': 
      return {
        accentBar: 'bg-orange-500',
        slotBorder: 'border-orange-500/30',
        slotBg: 'bg-orange-950/20',
        iconColor: 'text-orange-400',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        hover: 'hover:border-orange-500/50 hover:bg-orange-950/10'
      };
    case 'EPIC': case 'A': 
      return {
        accentBar: 'bg-purple-500',
        slotBorder: 'border-purple-500/30',
        slotBg: 'bg-purple-950/20',
        iconColor: 'text-purple-400',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        hover: 'hover:border-purple-500/50 hover:bg-purple-950/10'
      };
    case 'RARE': case 'B': 
      return {
        accentBar: 'bg-blue-500',
        slotBorder: 'border-blue-500/30',
        slotBg: 'bg-blue-950/20',
        iconColor: 'text-blue-400',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        hover: 'hover:border-blue-500/50 hover:bg-blue-950/10'
      };
    case 'COMMON': case 'C': 
      return {
        accentBar: 'bg-green-500',
        slotBorder: 'border-green-500/30',
        slotBg: 'bg-green-950/20',
        iconColor: 'text-green-400',
        badge: 'bg-green-500/10 text-green-400 border-green-500/20',
        hover: 'hover:border-green-500/50 hover:bg-green-950/10'
      };
    default: 
      return {
        accentBar: 'bg-zinc-600',
        slotBorder: 'border-zinc-700',
        slotBg: 'bg-zinc-900/40',
        iconColor: 'text-zinc-400',
        badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        hover: 'hover:border-zinc-500/50 hover:bg-zinc-950/10'
      };
  }
};

const ShopItemIcon = ({ type, className }: { type: string, className: string }) => {
  switch (type.toLowerCase()) {
    case 'weapon': return <Sword className={className} />;
    case 'armor':  return <Shield className={className} />;
    case 'accessory': return <Gem className={className} />;
    case 'potion': return <Droplet className={className} />;
    default: return <Box className={className} />;
  }
};

const ShopPanel = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { showNotify } = useSystemNotify();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Referencia para scrollear al inicio de la tienda
  const shopTopRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language?.split('-')[0] || 'es') as 'es' | 'en';

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['shop-items'],
    queryFn: ShopService.getAllItems,
  });

  const buyMutation = useMutation({
    mutationFn: (itemId: number) => ShopService.buyItem(itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toastNotification.success(t('shop.purchase_success_title', '¡¡¡Compra Exitosa!!!'), `${t('shop.gold_spent', 'Has gastado')}: ${data.gold_spent} G`);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.mensaje || err.response?.data?.detail;
        showNotify(`${t(`backend_errors.${errorCode}`)}`, "error", t('shop.system_error_title', 'ERROR EN EL SISTEMA'));
      }
    },
  });

  const filteredItems = useMemo(() => items.filter(item => filter === 'all' || item.type === filter), [filter, items]);

  // Lógica de Paginación Computada
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // FUNCIÓN CORREGIDA: Sube de manera infalible esperando al final del hilo de ejecución de React
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    setTimeout(() => {
      if (shopTopRef.current) {
        const yOffset = -55; // El margen en píxeles que quieres dejar arriba
        const elementPosition = shopTopRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + yOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 10);
  };

  const handleBuyClick = (item: ShopItem) => {
    if (!profile) return;
    if (profile.gold < item.price) {
      toastNotification.warning(t('shop.purchase_failed', 'Fallo al comprar'), t('shop.insufficient_gold', 'No tienes oro suficiente'));
      return;
    }
    buyMutation.mutate(item.id);
  };

  if (isLoadingProfile || isLoadingItems) {
    return (
      <div className="min-h-362 bg-background flex items-center justify-center p-6">
        <PreLoader message={t('shop.sync_message', 'Sincronizando Con el Sistema...')} />
      </div>
    );
  }

  return (
    <div ref={shopTopRef} className="flex flex-col gap-8 animate-fade-in-up mx-auto w-full max-w-[1240px]">
      <div className="system-panel rounded-2xl p-4 md:p-6 bg-zinc-950/80 border border-zinc-800/60 backdrop-blur-md">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-system-glow/10 rounded-xl border border-system-glow/20 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-system-glow animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-mono font-bold text-system-glow uppercase tracking-[0.25em]">{t('shop.title', 'Store Records')}</h2>
              <p className="text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-[0.3em] mt-1">{t('shop.subtitle', 'Official Purchase System')}</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-5 bg-zinc-900/60 px-6 py-4 rounded-2xl border border-zinc-800 shadow-inner min-w-[240px]">
            <span className="text-[10px] md:text-xs text-zinc-400 font-mono font-bold uppercase tracking-wider">{t('shop.balance', 'Gold Balance')}</span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-system-gold" />
              <span className="text-xl md:text-2xl font-mono text-system-gold font-bold tracking-tight">
                {profile?.gold.toLocaleString()} <span className="text-xs md:text-sm text-system-gold/80">G</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {[ { id: 'all', icon: LayoutGrid }, { id: 'weapon', icon: Sword }, { id: 'armor', icon: Shield }, { id: 'accessory', icon: Gem } ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setFilter(id as FilterOption); handlePageChange(1); }}
              className={`group flex items-center gap-2 px-5 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 border-b-2 shrink-0 ${filter === id ? 'border-system-glow text-system-glow bg-system-glow/5 shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${filter === id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{id === 'all' ? t('shop.filter_all', 'TODOS') : t(`shop.filter_${id}`, id)}</span>
            </button>
          ))}
        </div>

        {/* Grid de Items Paginados */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {paginatedItems.map(item => {
            const canAfford = (profile?.gold || 0) >= item.price;
            const isBuying = buyMutation.variables === item.id && buyMutation.isPending;
            const rStyle = getRarityDesign(item.rarity);
            const itemName = item.name[currentLang] || item.name['es'];
            const itemDescription = item.description[currentLang] || item.description['es'];

            return (
              <div key={item.id} className={`group/card flex flex-col sm:flex-row items-stretch bg-zinc-900/30 border border-zinc-800/80 rounded-xl relative overflow-hidden transition-all duration-300 ${rStyle.hover}`}>
                <div className={`w-1 shrink-0 ${rStyle.accentBar}`} />
                <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex flex-col items-center gap-2 shrink-0 w-16">
                      <div className={`w-16 h-16 rounded-lg border flex items-center justify-center bg-zinc-950 shadow-inner transition-colors ${rStyle.slotBorder} ${rStyle.slotBg}`}>
                        <ShopItemIcon type={item.type} className={`w-8 h-8 ${rStyle.iconColor}`} />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wider uppercase whitespace-nowrap ${rStyle.badge}`}>
                        {t(`rarities.${item.rarity.toUpperCase()}`, item.rarity)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5 w-full">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-zinc-100 uppercase tracking-wide font-mono leading-tight flex-1 break-words" title={itemName}>
                          {itemName}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400 font-sans leading-relaxed min-h-[60px] max-h-[70px] overflow-y-auto custom-scrollbar pr-2 break-words">
                        {itemDescription}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900/80 border border-zinc-800 rounded-md text-[12px] font-data text-system-cyan uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-system-cyan shadow-[0_0_4px_#00e5ff]" />
                      +{item.stat_value} {t(`stats.${item.stat_type.toLowerCase()}`, item.stat_type)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyClick(item)}
                  disabled={!canAfford || isBuying}
                  className={`group w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-zinc-800/80 p-4 flex sm:flex-col items-center justify-center gap-3 sm:gap-2 font-mono text-xs font-bold uppercase transition-all duration-300 shrink-0 text-center min-h-[70px] sm:min-h-auto disabled:cursor-not-allowed ${
                    canAfford && !isBuying ? 'bg-zinc-900/40 text-system-gold hover:bg-zinc-900/50' : 'bg-zinc-950/20 text-zinc-600'
                  }`}
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-system-gold" />
                      <span className="text-[10px] tracking-widest text-zinc-400">{t('shop.processing', 'PROCESANDO...')}</span>
                    </>
                  ) : !canAfford ? (
                    <div className="flex sm:flex-col items-center justify-center gap-1.5 w-full">
                      <span className="text-zinc-500 font-medium tracking-tight line-through opacity-50">{item.price.toLocaleString()} G</span>
                      <span className="text-[9px] text-red-500/70 font-bold tracking-tight">{t('shop.locked', 'BLOQUEADO')}</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] group-hover:scale-120" />
                      <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0.5 transition-all duration-300">
                        <span className="text-[12px] opacity-80 tracking-widest transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] group-hover:scale-120">BUY</span>
                        <span className="text-sm font-bold tracking-wide text-system-gold transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] group-hover:scale-120">
                          {item.price.toLocaleString()} G
                        </span>
                      </div>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Sin Items */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-black/10 mt-6">
            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">{t('shop.no_items', '[No available items in this system branch]')}</p>
          </div>
        )}

        {/* --- CONTROLES DE PAGINACIÓN TÁCTICA --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-t-zinc-900/60 font-mono">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-system-glow hover:border-system-glow/50 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-sm uppercase tracking-widest text-zinc-400 bg-zinc-900/40 px-4 py-2 rounded border border-zinc-900">
              {t('shop.page', 'PÁGINA')} <span className="text-system-glow font-bold">{currentPage}</span> / <span className="text-zinc-600">{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-system-glow hover:border-system-glow/50 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopPanel;