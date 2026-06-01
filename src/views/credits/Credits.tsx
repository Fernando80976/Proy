import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Swords, Brain, Database, Layers } from 'lucide-react';
import { FaGithub, FaLinkedin } from "react-icons/fa";


interface SocialLinks {
  github: string;
  linkedin: string;
}


interface DeveloperStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  barColor: string;
}


interface Developer {
  name: string;
  role: string;
  description: string;
  avatar: string;
  rank: string;
  social: SocialLinks;
  stats: DeveloperStat[];
}


const crearParticulasCreditos = () => {
  return Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
  }));
};

const CreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  

  const [showSystem, setShowSystem] = useState<boolean>(false);

  const [particulasFondo] = useState(crearParticulasCreditos);

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 300);
    return () => clearTimeout(timer);
  }, []);


  const developers: Developer[] = [
    {
      name: "Manuel Velásquez",
      role: t('creditos.roles.frontend', 'FRONTEND DEVELOPER & DB ARCHITECT'),
      description: t('creditos.descripciones.manuel', 'Creador del Sistema. Encargado de forjar una interfaz de usuario interactiva, inmersiva y estructurar los núcleos de datos relacionales en Supabase.'),
      avatar: "https://github.com/Barsa1205.png", 
      rank: "S-RANK",
      social: {
        github: "https://github.com/Barsa1205",
        linkedin: "https://www.linkedin.com/in/manuel-antonio-velasquez-gutierrez-703750306/"
      },
      stats: [
        { label: 'FRONT', value: 95, icon: <Swords className="w-4 h-4" />, color: 'text-red-400', barColor: 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
        { label: 'BBDD', value: 92, icon: <Database className="w-4 h-4" />, color: 'text-purple-400', barColor: 'bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]' },
        { label: 'UI/UX', value: 88, icon: <Layers className="w-4 h-4" />, color: 'text-green-400', barColor: 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' }
      ]
    },
    {
      name: "Fernando Basanta",
      role: t('creditos.roles.backend', 'BACKEND DEVELOPER & MASTER OF LOGIC'),
      description: t('creditos.descripciones.fernando', 'Arquitecto de las sombras. Encargado de sincronizar la lógica de las salas de juego por turnos con FastAPI y gestionar las conexiones WebSocket en tiempo real.'),
      avatar: "https://github.com/Fernando80976.png",
      rank: "S-RANK",
      social: {
        github: "https://github.com/Fernando80976",
        linkedin: "https://www.linkedin.com/in/fernando-basanta-quimbayo-a26470385/"
      },
      stats: [
        { label: 'BACK', value: 93, icon: <Brain className="w-4 h-4" />, color: 'text-blue-400', barColor: 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
        { label: 'WSOCK', value: 89, icon: <Layers className="w-4 h-4" />, color: 'text-orange-400', barColor: 'bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]' },
        { label: 'LOGIC', value: 90, icon: <Brain className="w-4 h-4" />, color: 'text-system-glow', barColor: 'bg-system-glow shadow-[0_0_12px_rgba(0,229,255,0.6)]' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans p-6 md:p-10 select-none">
      
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particulasFondo.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-system-glow/30 animate-pulse"
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

      
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12 opacity-5 font-mono text-xs md:text-sm tracking-widest text-system-glow select-none">
        <div className="flex justify-between w-full">
          <span>[SYSTEM_CREATION_LOG: SUCCESS]</span>
          <span>[VERSION: DAW2_TFC_2.0]</span>
        </div>
        <div className="flex justify-center translate-y-24">
          <span className="text-6xl md:text-9xl font-black tracking-[0.4em] text-center opacity-25">ARISE</span>
        </div>
        <div className="flex justify-between w-full">
          <span>[MONARCH_PROJECT_INITIALIZED]</span>
          <span>[COORDINATES: LAT_40.4167_MADRID]</span>
        </div>
      </div>

      
      <div className={`relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center transition-all duration-1000 ${showSystem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
      
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Swords className="w-10 h-10 text-system-glow animate-float" />
            <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-widest system-text uppercase drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              {t('creditos.titulo', 'SYSTEM DEVELOPERS')}
            </h1>
            <Swords className="w-10 h-10 text-system-glow animate-float" />
          </div>
          <p className="text-muted-foreground text-base font-sans tracking-wider max-w-xl bg-background/40 px-4 py-1.5 rounded-full border border-system-glow/10 backdrop-blur-sm">
            {t('creditos.subtitulo', '[The entities that encoded and awakened the Monarch System]')}
          </p>
        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4">
          {developers.map((dev, index) => (
            <div 
              key={index} 
              className="system-panel rounded-2xl p-8 md:p-10 relative group bg-background/70 backdrop-blur-md transition-all duration-300 hover:border-system-glow/60 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
            >
      
              <div className="absolute top-5 right-5 font-mono text-xs tracking-widest px-3 py-1 border border-system-glow/40 text-system-glow bg-system-glow/10 rounded font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                {dev.rank}
              </div>

              <div className="flex flex-col items-center text-center space-y-6">
                
      
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-system-glow/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={dev.avatar} 
                    alt={dev.name} 
                    className="w-28 h-28 rounded-full border-2 border-system-glow/40 object-cover aspect-square group-hover:scale-105 transition-transform duration-500 relative z-10"
                  />
                </div>

      
                <div>
                  <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-wide text-foreground group-hover:text-system-glow transition-colors">
                    {dev.name}
                  </h2>
                  <p className="text-system-glow text-xs md:text-sm font-mono tracking-widest uppercase mt-2 font-semibold">
                    {dev.role}
                  </p>
                </div>

      
                <p className="text-muted-foreground text-sm font-sans leading-relaxed min-h-[60px] px-4 max-w-md">
                  {dev.description}
                </p>

      
                <div className="w-full space-y-4 pt-4 border-t border-system-glow/20">
                  {dev.stats.map((stat, sIndex) => (
                    <div key={sIndex} className="flex items-center gap-3 w-full text-left">
                      
      
                      <div className={`flex items-center gap-1.5 w-20 text-xs font-mono font-bold ${stat.color} tracking-wider`}>
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>

      
                      <div className="flex-1 h-3 bg-black/50 rounded-md border border-system-glow/20 p-[1.5px] overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-sm transition-all duration-1000 ${stat.barColor}`}
                          style={{ width: showSystem ? `${stat.value}%` : '0%' }}
                        />
                      </div>

      
                      <span className="font-mono text-xs font-bold text-foreground w-6 text-right">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

      
                <div className="flex gap-5 pt-2 w-full justify-center">
                  <a 
                    href={dev.social.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-background/50 border border-system-glow/20 rounded-lg hover:border-system-glow hover:text-system-glow text-muted-foreground transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    title="GitHub Profile"
                  >
                    <FaGithub size={20} />
                  </a>
                  <a 
                    href={dev.social.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-background/50 border border-system-glow/20 rounded-lg hover:border-system-glow hover:text-system-glow text-muted-foreground transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                    title="LinkedIn Profile"
                  >
                    <FaLinkedin size={20} />
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      
        <button 
          onClick={() => navigate('/')}
          className="mt-16 py-3.5 px-8 rounded-lg bg-background/40 border border-system-glow/30 text-muted-foreground font-mono text-sm tracking-widest hover:text-system-glow hover:border-system-glow hover:bg-system-glow/5 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all cursor-pointer flex items-center gap-3"
        >
          <ArrowLeft size={16} />
          {t('creditos.volver', 'RETURN TO SYSTEM MENU')}
        </button>

      </div>
    </div>
  );
};

export default CreditsPage;