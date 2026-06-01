import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Crown, ScrollText, Landmark, Package, Zap, ShoppingBag, Trophy,
  LogOut, Menu as MenuIcon, X, Swords, ChevronRight,
  Settings, Coins, BarChart3
} from 'lucide-react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/AuthService';
import { queryClient } from '../../api/QueryClient';

import Preloader from '../common/Preloader';
import { hunterService, type PlayerProfile } from '../../services/StatusService';
import { useQuery } from '@tanstack/react-query';
import ModalConfiguracion from '../common/ModalConfig';

type TabId = 'status' | 'quests' | 'dungeons' | 'inventory' | 'skills' | 'shop' | 'ranking';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'status', label: 'navbar.status', icon: <Crown className="w-5 h-5" />, path: '/Game/Status' },
  { id: 'quests', label: 'navbar.quests', icon: <ScrollText className="w-5 h-5" />, path: '/Game/Quests' },
  { id: 'dungeons', label: 'navbar.dungeons', icon: <Landmark className="w-5 h-5" />, path: '/Game/Dungeons' },
  { id: 'inventory', label: 'navbar.inventory', icon: <Package className="w-5 h-5" />, path: '/Game/Inventory' },
  { id: 'skills', label: 'navbar.skills', icon: <Zap className="w-5 h-5" />, path: '/Game/Skills' },
  { id: 'shop', label: 'navbar.shop', icon: <ShoppingBag className="w-5 h-5" />, path: '/Game/Shop' },
  { id: 'ranking', label: 'navbar.ranking', icon: <Trophy className="w-5 h-5" />, path: '/Game/Ranking' },
];

const PlayerStatsModules = ({ player, isMobile = false }: { player?: PlayerProfile, isMobile?: boolean }) => {
  const { t } = useTranslation();
  const expPercentage = player && player.exp_next_level ? Math.floor((player.experience / player.exp_next_level) * 100) : 0;

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3 w-full' : 'items-center gap-3 lg:gap-5'} font-mono select-none`}>
      <div className={`relative flex h-11 bg-black/40 border border-white/10 shadow-[inset_0_1px_8px_rgba(0,0,0,0.6)] skew-x-[-8deg] overflow-hidden group hover:border-system-glow/40 transition-colors duration-300 ${isMobile ? 'w-full' : ''}`}>
        <div className="absolute top-0 right-0 w-[70px] h-full bg-system-glow/15 border-l border-system-glow/30" />
        <div className="relative flex w-full h-full skew-x-[8deg] items-center">
          <div className="pl-6 pr-4 flex flex-col justify-center min-w-[120px] flex-1">
            <span className="text-[9.5px] text-muted-foreground/80 uppercase tracking-[0.2em] font-black leading-none mb-1">
              {t('navbar.hunter')}
            </span>
            <span className="text-sm font-black text-foreground tracking-wider truncate max-w-[110px] leading-none">
              {player?.username || t('navbar.unknown')}
            </span>
          </div>
          <div className="pr-6 pl-2 flex flex-col justify-center items-center min-w-[55px]">
            <span className="text-[9.5px] text-system-glow/90 uppercase tracking-[0.2em] font-black leading-none mb-1">
              {t('navbar.level')}
            </span>
            <span className="text-sm font-black text-system-glow drop-shadow-[0_0_5px_hsl(var(--system-glow))] leading-none">
              {player?.level || '0'}
            </span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-glow/50 group-hover:border-system-glow transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-glow/50 group-hover:border-system-glow transition-colors" />
      </div>

      <div className={`relative flex h-11 px-4 bg-black/40 border border-system-gold/20 shadow-[inset_0_1px_8px_rgba(0,0,0,0.6)] skew-x-[-8deg] group hover:border-system-gold/40 transition-colors duration-300 ${isMobile ? 'w-full' : ''}`}>
        <div className="flex flex-col justify-center w-full skew-x-[8deg]">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins className="w-3 h-3 text-system-gold drop-shadow-[0_0_2px_hsl(var(--system-gold))]" />
            <span className="text-[9.5px] text-system-gold/80 uppercase tracking-[0.2em] font-black leading-none">
              {t('navbar.gold')}
            </span>
          </div>
          <span className="text-sm font-black text-system-gold tracking-widest block leading-none">
            {player?.gold !== undefined ? player.gold.toLocaleString() : '0'} G
          </span>
        </div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-gold/40 group-hover:border-system-gold transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-system-gold/40 group-hover:border-system-gold transition-colors" />
      </div>

      <div className={`relative flex h-11 px-4 min-w-[180px] lg:min-w-[220px] bg-black/40 border border-system-glow/20 shadow-[inset_0_1px_8px_rgba(0,0,0,0.6)] skew-x-[-8deg] group hover:border-system-glow/40 transition-colors duration-300 ${isMobile ? 'w-full' : ''}`}>
        <div className="flex flex-col justify-center w-full skew-x-[8deg]">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[9.5px] text-system-glow/80 uppercase tracking-[0.2em] font-black leading-none">{t('navbar.exp')}</span>
            <span className="text-[10px] text-system-glow font-black leading-none drop-shadow-[0_0_5px_hsl(var(--system-glow))]">
              {expPercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-black/80 border border-system-glow/30 overflow-hidden relative">
            <div 
              className="h-full bg-system-glow shadow-[0_0_10px_rgba(0,229,255,0.8)] relative transition-all duration-1000 ease-out" 
              style={{ width: `${expPercentage}%` }} 
            >
              <div className="absolute top-0 right-0 w-3 h-full bg-white/80 blur-[2px]" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-glow/40 group-hover:border-system-glow transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-glow/40 group-hover:border-system-glow transition-colors" />
      </div>
    </div>
  );
};

const GameDashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: player, isLoading } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const currentActiveItem = NAV_ITEMS.find(item => 
    location.pathname.toLowerCase() === item.path.toLowerCase()
  );

  const activeTab = currentActiveItem ? currentActiveItem.id : 'status';

  const handleLogout = async (): Promise<void> => {
      setIsLoggingOut(true);
      await authService.logout();
      queryClient.clear();
      navigate('/', { replace: true });
  };

  if (isLoggingOut || isLoading) {
    return (
      <div className="min-h-svh bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message={isLoggingOut ? t('navbar.logging_out') : t('navbar.loading_sync')} />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background flex flex-col font-sans selection:bg-system-glow/30 selection:text-white antialiased">

      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b-2 border-system-glow/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 relative min-h-[70px]">
          
          {/* Identificador para el menú hamburguesa en móvil */}
          <div className="flex-none xl:hidden z-10">
            <button
              id="tutorial-hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-system-glow hover:bg-system-glow/10 border border-system-glow/20 rounded transition-all duration-200"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0 flex items-center justify-center z-0">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 group relative transition-all duration-300 focus:outline-none active:scale-95"
            >
              <div className="relative p-1.5 bg-black/40 border border-system-glow/30 rounded-sm overflow-hidden transition-colors duration-300 group-hover:border-system-glow group-hover:bg-system-glow/5">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-system-glow/20 to-transparent -translate-y-full group-hover:animate-matrix-scan" />
                <Swords className="w-6 h-6 text-system-glow transition-all duration-300 filter drop-shadow-[0_0_4px_hsl(var(--system-glow)/0.4)] group-hover:drop-shadow-[0_0_10px_hsl(var(--system-glow))] group-hover:scale-110" />
              </div>

              <span className="text-lg font-mono system-text font-black tracking-[0.35em] hidden xl:block select-none transition-all duration-300 group-hover:drop-shadow-[0_0_10px_hsl(var(--system-glow))]">
                THE ARISE OF MONARCH
              </span>
            </button>
          </div>

          <div className="flex-none z-10 flex items-center justify-end">
            
            {/* Identificador para el contenedor de estadísticas en Desktop */}
            <div className="hidden lg:flex" id="tutorial-desktop-stats">
              <PlayerStatsModules player={player} />
            </div>

            {/* Identificador para el trigger de estadísticas en Móvil */}
            <div className="lg:hidden">
              <Menu as="div" className="relative">
                <MenuButton 
                  id="tutorial-stats-trigger-btn"
                  className="p-2 bg-black/40 border border-system-glow/30 text-system-glow hover:bg-system-glow/10 rounded transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-system-glow"
                >
                  <BarChart3 className="w-6 h-6 drop-shadow-[0_0_4px_hsl(var(--system-glow)/0.4)]" />
                </MenuButton>
                
                <MenuItems className="absolute right-0 top-12 mt-4 w-[280px] bg-background border-2 border-system-glow/20 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-4 z-50 rounded-xs focus:outline-none origin-top-right transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
                  <MenuItem>
                    <div className="w-full">
                      <PlayerStatsModules player={player} isMobile={true} />
                    </div>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>

          </div>
        </div>
      </header>

      
      <div className="flex flex-1 relative">
        
        {/* Identificador para la navegación lateral en Desktop */}
        <nav
          id="tutorial-sidebar-nav"
          className={`fixed xl:sticky top-[71px] left-0 z-30 h-[calc(100vh-71px)] bg-card/98 backdrop-blur-xl border-r-2 border-system-glow/20 w-72 transition-transform duration-300 xl:translate-x-0 shadow-[4px_0_30px_rgba(0,0,0,0.6)] ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col p-5 overflow-y-auto custom-scrollbar gap-4">
            
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between mb-2 px-3">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.35em] font-black">
                  {t('navbar.system_core_menu')}
                </p>
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-system-glow" />
                  <span className="w-1 h-1 rounded-full bg-system-glow/40 animate-ping" />
                </div>
              </div>
              
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setMenuOpen(false); navigate(item.path); }}
                  className={`group relative flex items-center gap-4 px-5 py-3.5 border text-sm font-mono font-black transition-all duration-150 flex-shrink-0 text-left overflow-hidden ${
                    activeTab === item.id
                      ? 'bg-system-glow/10 text-system-glow border-system-glow/40 rounded-sm shadow-[0_0_15px_rgba(0,229,255,0.08)]'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5 hover:border-white/5 rounded-xs'
                  }`}
                >
                  {activeTab === item.id && (
                    <span className="absolute left-0 top-1 bottom-1 w-[4px] bg-system-glow shadow-[0_0_10px_hsl(var(--system-glow))]" />
                  )}

                  <span className={`transition-transform duration-200 ${
                    activeTab === item.id 
                      ? 'text-system-glow filter drop-shadow-[0_0_6px_hsl(var(--system-glow))] scale-105' 
                      : 'group-hover:scale-110 group-hover:text-foreground'
                  }`}>
                    {item.icon}
                  </span>
                  
                  <span className="tracking-[0.2em] uppercase text-xs">{t(item.label)}</span>
                  
                  {activeTab === item.id ? (
                    <div className="ml-auto flex items-center">
                      <span className="w-1.5 h-1.5 bg-system-glow rounded-full animate-pulse mr-1" />
                      <ChevronRight className="w-4 h-4 text-system-glow" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground/40" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-white/5 my-1 flex-shrink-0" />

            <div className="flex flex-col gap-2 pb-1 flex-shrink-0">
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full flex items-center gap-4 px-5 py-3 border border-transparent rounded-xs bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all duration-150 group whitespace-nowrap text-left"
              >
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-system-glow group-hover:rotate-45 transition-all duration-300 flex-shrink-0" />
                <span className="font-mono text-xs font-black tracking-[0.2em] uppercase truncate">
                  {t('navbar.settings')}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3 border border-red-500/20 rounded-xs bg-red-500/5 hover:bg-red-500/15 transition-all duration-150 text-red-400 font-mono text-xs font-black group whitespace-nowrap text-left"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1 flex-shrink-0 text-red-400/80" />
                <span className="uppercase tracking-[0.2em] truncate">
                  {t('navbar.logout')}
                </span>
              </button>

              <div className="pt-2 px-3 flex-shrink-0 select-none">
                <div className="h-[1px] bg-white/5 w-full mb-2" />
                <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.25em] font-black">
                  <span className="text-muted-foreground/40">{t('navbar.system_version')}</span>
                  <span className="text-system-cyan flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-system-cyan animate-pulse" /> v2.0-STABLE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </nav>

        {menuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/80 backdrop-blur-xs xl:hidden transition-all duration-300"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 w-full max-xl:p-6 xl:py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="system-panel border border-white/5 rounded-xl p-5 min-h-[450px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] relative">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      <ModalConfiguracion 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}

export default GameDashboard;