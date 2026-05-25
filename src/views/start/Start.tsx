import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Info, Play, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModalConfiguracion from '../../components/common/ModalConfig';

const Inicio = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const [particles] = useState(() =>
    Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 6.5 + Math.random() * 2
    }))
  );

  // MEJORA: Clases optimizadas con mayor opacidad de fondo para combatir la luz ambiental
  const menuItemClasses = `
    group relative flex items-center gap-6 py-4 px-8
    font-mono text-sm tracking-[0.4em] uppercase transition-all duration-500
    bg-slate-900/60 backdrop-blur-md border border-system-glow/30
    hover:bg-system-glow/20 hover:border-system-glow/70 hover:translate-x-2
    w-full max-w-sm rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]
  `;

  return (
    // MEJORA: Aseguramos un color de fondo base sólido por si las imágenes/gradientes fallan con la luz
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background flex flex-col items-center justify-center font-sans select-none selection:bg-system-glow/30">
      
      {/* --- CAPAS DE FONDO --- */}
      {/* MEJORA: Bajamos levemente la opacidad del vignette para que las esquinas no sean negras puras y ciegas con luz */}
      <div className="absolute inset-0 bg-gate-bg opacity-90" />
      <div className="absolute inset-0 bg-vignette opacity-60 pointer-events-none" />
      
      {/* Efecto de rejilla táctica (Grid) - MEJORA: Subimos la opacidad de 0.03 a 0.06 para dar más textura visual en entornos iluminados */}
      <div className="absolute inset-0 opacity-[0.10] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(to right, hsl(var(--system-glow)) 1px, transparent 1px), 
                                linear-gradient(to bottom, hsl(var(--system-glow)) 1px, transparent 1px)`, 
                    backgroundSize: '40px 40px' }} />

      {/* --- FRAME DE LA INTERFAZ --- */}
      {/* MEJORA: Subimos la opacidad del borde exterior para enmarcar mejor la pantalla */}
      <div className="absolute inset-6 border border-system-glow/30 pointer-events-none">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-glow" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-system-glow" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-system-glow" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-glow" />
      </div>

      {/* --- PARTÍCULAS DE MANÁ --- */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -bottom-10 bg-system-glow rounded-full animate-essence-rise"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: `0 0 15px hsl(var(--system-glow))`
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/40 to-transparent h-32 animate-scan-line" />
      </div>

      {/* --- CONTENIDO CENTRAL --- */}
      <div className="z-20 text-center flex flex-col items-center w-full max-w-4xl animate-logo-reveal px-4">
        
        <header className="relative mb-16 group">
          <div className="overflow-hidden">
            {/* MEJORA: Cambiado de text-white a text-slate-100 con tracking fuerte para máxima lectura */}
            <span className="text-lg md:text-xl tracking-[1em] text-slate-100 font-mono block mb-3 font-semibold drop-shadow-md">
              SOLO LEVELING
            </span>
          </div>

          {/* MEJORA: Aseguramos que el degradado del título tenga una base de alto contraste */}
          <h1 className="relative text-[clamp(4.2rem,8vw,8rem)] font-bold tracking-tighter leading-none transition-all duration-700">
            <span className="text-monarch block drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                  style={{ filter: `drop-shadow(0 0 25px hsl(var(--system-glow) / 0.5))` }}>
              THE ARISE OF MONARCH
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-system-glow" />
            <Zap className="w-4 h-4 text-system-glow animate-pulse" />
            <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-system-glow" />
          </div>
        </header>

        {/* --- MENÚ DE ACCESO --- */}
        <nav className="flex flex-col items-center gap-4 w-full px-6">
          
          {/* Botón Iniciar Juego */}
          <button 
            onClick={() => navigate('/Login')} 
            className={`${menuItemClasses} border-l-4 border-l-system-glow bg-system-glow/15`}
          >
            <div className="p-2 bg-system-glow/20 rounded-sm">
              <Play className="w-5 h-5 text-system-glow fill-system-glow" />
            </div>
            {/* MEJORA: Texto con color sólido y blanco de alta intensidad */}
            <span className="text-white text-glow-strong font-bold">{t('inicio.iniciar')}</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-mono text-system-glow font-bold">{t('inicio.enter')}</span>
            </div>
          </button>

          {/* Botón Configuración */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className={menuItemClasses}
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-system-glow transition-colors" />
            {/* MEJORA: Cambiado text-muted-foreground por text-slate-300 para entornos iluminados */}
            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
              {t('inicio.configuracion')}
            </span>
          </button>

          {/* Botón Créditos */}
          <button 
            onClick={() => navigate('/Credits')}
            className={menuItemClasses}
          >
            <Info className="w-5 h-5 text-slate-400 group-hover:text-system-glow transition-colors" />
            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
              {t('inicio.creditos')}
            </span>
          </button>

        </nav>
          
      </div>

      <ModalConfiguracion 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}

export default Inicio;