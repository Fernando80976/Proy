import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Zap, 
  Target, 
  Sword,
  Loader2 
} from 'lucide-react';
import { classService, type PlayerClass } from '../../services/ClassService';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Preloader from '../../components/common/Preloader';
import i18n from '../../i18n/config';

interface IconConfig {
  icon: React.ReactNode;
  glowColor: string;
  textColor: string;
  hoverTextColor: string;
  hoverBorderColor: string;
  badgeColor: string;
}

const iconMap: Record<string, IconConfig> = {
  "GUERRERO": {
    icon: <Sword className="w-14 h-14 mb-3" />,
    glowColor: "rgba(239, 68, 68, 0.30)", 
    textColor: "text-red-400",
    hoverTextColor: "group-hover:text-red-400", 
    hoverBorderColor: "hover:border-red-400/50",
    badgeColor: "bg-red-500/10 border-red-500/30 text-red-400"
  },
  "ASESINO": {
    icon: <Sword className="w-14 h-14 mb-3 rotate-45" />,
    glowColor: "rgba(168, 85, 247, 0.30)",
    textColor: "text-purple-400",
    hoverTextColor: "group-hover:text-purple-400",
    hoverBorderColor: "hover:border-purple-400/50",
    badgeColor: "bg-purple-500/10 border-purple-500/30 text-purple-400"
  },
  "MAGO": {
    icon: <Zap className="w-14 h-14 mb-3" />,
    glowColor: "rgba(59, 130, 246, 0.30)", 
    textColor: "text-blue-400",
    hoverTextColor: "group-hover:text-blue-400",
    hoverBorderColor: "hover:border-blue-400/50",
    badgeColor: "bg-blue-500/10 border-blue-500/30 text-blue-400"
  },
  "ARQUERO": {
    icon: <Target className="w-14 h-14 mb-3" />,
    glowColor: "rgba(74, 222, 128, 0.30)",
    textColor: "text-green-400",
    hoverTextColor: "group-hover:text-green-400",
    hoverBorderColor: "hover:border-green-400/50",
    badgeColor: "bg-green-500/10 border-green-500/30 text-green-400"
  },
  "TANQUE": {
    icon: <Shield className="w-14 h-14 mb-3" />,
    glowColor: "rgba(249, 115, 22, 0.30)",
    textColor: "text-orange-400",
    hoverTextColor: "group-hover:text-orange-400",
    hoverBorderColor: "hover:border-orange-400/50",
    badgeColor: "bg-orange-500/10 border-orange-500/30 text-orange-400"
  },
  "default": {
    icon: <Sword className="w-14 h-14 mb-3" />,
    glowColor: "rgba(0, 229, 255, 0.15)",
    textColor: "text-system-glow",
    hoverTextColor: "group-hover:text-system-glow",
    hoverBorderColor: "hover:border-system-glow/50",
    badgeColor: "bg-system-glow/10 border-system-glow/30 text-system-glow"
  }
};


const crearParticulasSeleccion = () => {
  return Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
  }));
};

const ClassSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentLang = (i18n.language?.split('-')[0] || 'es') as 'es' | 'en';
  
  const [loadingSource, setLoadingSource] = useState<boolean | null>(null);
  const mensajeCarga = loadingSource ? t('class.loading_sync') : t('class.assigning');


  const [particulasFondo] = useState(crearParticulasSeleccion);


  const { data: classes, isLoading: isLoadingClasses, isError } = useQuery({
    queryKey: ['player-classes'],
    queryFn: classService.getClasses,
  });


  const mutation = useMutation({
    mutationFn: (classId: number) => classService.selectClass({ class_id: classId }),
    onSuccess: async (data) => {
      console.log("Clase seleccionada con éxito:", data);
      setLoadingSource(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await queryClient.invalidateQueries({ queryKey: ['verify-class'] });
      navigate('/Game/Status', { replace: true, state: { skipCheck: true } });
    },
    onError: (error) => {
      alert(t('class.selection_error', { message: error.message || t('class.error_unknown') }));
    }
  });

  const handleSelectClass = (classId: number) => {
    if (mutation.isPending) return;
    mutation.mutate(classId);
  };

  if (isLoadingClasses) {
    return (
      <div className="min-h-svh bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message={t('class.loading_sync')} />
      </div>
    );
  }

  if (loadingSource || mutation.isPending) {
    return (
      <div className="min-h-svh bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message={mensajeCarga} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-svh bg-black flex items-center justify-center text-red-500 font-mono">
        <div className="border border-destructive/40 bg-destructive/5 px-6 py-4 rounded font-mono text-destructive text-center max-w-md animate-fade-in-up">
          <p className="font-bold uppercase tracking-widest mb-1">🔥 {t('class.error_title')} 🔥</p>
          <p className="text-sm opacity-80">{t('class.error_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-screen text-foreground flex flex-col items-center justify-center px-8 py-4 relative overflow-hidden select-none">
      
      {/* 1. SISTEMA DE PARTÍCULAS DEL FONDO (Idéntico a Credits) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particulasFondo.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-system-glow/35 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>


      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/20 to-transparent h-40 animate-scan-line" />
      </div>


      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center z-10 space-y-6">
        

        <div className="text-center animate-fade-in-up space-y-3 relative">

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-system-glow/30"></span>
            <span className="text-[10px] font-mono tracking-[0.5em] text-system-glow/60 uppercase">
              {t('class.protocol')}
            </span>
            <span className="h-[1px] w-8 bg-system-glow/30"></span>
          </div>

          <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-[0.25em] text-system-glow uppercase drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            {t('class.selection')}
          </h1>


          <div className="flex justify-center">
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-system-glow to-transparent opacity-50"></div>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground font-sans text-sm md:text-base tracking-[0.1em] leading-relaxed">
              <span className="text-system-glow/80 font-mono mr-2">[{t('class.system_tag')}]:</span>
              "{t('class.description')}"
            </p>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full justify-center items-center">
          {classes?.map((item: PlayerClass, index: number) => {

            const classKey = item.name.es
              .toUpperCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
              
            const config = iconMap[classKey] || iconMap["default"];
            
            
            const gridSpanClass = index < 3 
              ? "md:col-span-2" 
              : "md:col-span-3 max-w-xl justify-self-center w-full";

            return (
              <div 
                key={item.id}
                onClick={() => handleSelectClass(item.id)} 
                style={{ animationDelay: `${index * 120}ms` }} 
                className={`${gridSpanClass} animate-fade-in-up flex flex-col justify-between p-8 rounded-xl bg-card/50 border border-system-glow/20 
                  cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 
                  ${config.hoverBorderColor} shadow-2xl group relative overflow-hidden h-[310px] bg-background/70 backdrop-blur-md
                  [animation-fill-mode:backwards]
                  ${mutation.isPending ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
            
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 75%)` }}
                />


                <div className="flex flex-col items-center text-center">
                  <div className={`${config.textColor} drop-shadow-[0_0_10px_currentColor] transition-transform duration-300 group-hover:scale-110`}>
                    {config.icon}
                  </div>
                  
                  <h2 className={`text-2xl font-mono font-bold uppercase tracking-widest text-foreground ${config.hoverTextColor} transition-colors`}>
                    {item.name[currentLang]}
                  </h2>
                  

                  <div className="w-16 h-[2px] bg-white/10 my-3 group-hover:w-28 group-hover:bg-system-glow/40 transition-all duration-300" />
                  
                  <p className="text-sm text-muted-foreground font-data leading-relaxed tracking-wide px-2 line-clamp-3">
                    {item.description[currentLang]}
                  </p>
                </div>


                <div className="mt-4 flex flex-col gap-3 z-10">
                  <p className="text-xs md:text-sm text-center italic font-sans text-system-cyan/90 font-medium tracking-wide">
                    {item.description_effect[currentLang]}
                  </p>

                  <div className={`flex justify-between items-center px-4 py-2 rounded-lg border text-xs font-mono font-semibold tracking-wider ${config.badgeColor}`}>
                    <span className="opacity-75 uppercase">{t('class.attribute_bonus')}</span>
                    <span className="text-sm font-bold">+{item.stats_bonus} {item.target_stat}</span>
                  </div>
                </div>


                {mutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-system-glow" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ClassSelection;