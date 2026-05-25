import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DleService, { 
  type AttributeComparison,
  type SavedAttempt 
} from '../../services/DleService';
import { Ban, Check, ArrowUp, ArrowDown, Loader2, Target, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { getAssetUrl } from '../../utils/Assets';

// Interfaz actualizada para reflejar que ahora recibimos strings
export interface DleAttemptUI {
  name: string;
  image_key: string;
  race: AttributeComparison;
  rank: AttributeComparison;
  class: AttributeComparison;
  affiliation: AttributeComparison;
}

interface DleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DleModal: React.FC<DleModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: catalog = [] } = useQuery({
    queryKey: ['dle-catalog'],
    queryFn: DleService.getCharactersCatalog,
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  const { data: dailyStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['dle-status'],
    queryFn: DleService.getDailyStatus,
    enabled: isOpen,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: (characterId: number) => DleService.submitGuess(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dle-status'] });
      setSearchTerm("");
    },
  });

  // Lógica de mapeo de intentos corregida
  const attempts = useMemo(() => {
    if (!dailyStatus?.attempts_history || catalog.length === 0) return [];
    
    return dailyStatus.attempts_history.map((att: SavedAttempt) => {
      const char = catalog.find(c => c.id === att.character_id);
      return {
        // Usamos name_data que viene del catálogo (ahora es string)
        name: char?.name_data || "???", 
        image_key: char?.image_key || "unknown",
        ...att.comparison
      } as DleAttemptUI;
    });
  }, [dailyStatus, catalog]);

  const isWon = dailyStatus?.is_completed || false;

  // Buscador corregido para usar name_data
  const filteredCharacters = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return catalog
      .filter(char => 
        char.name_data.toLowerCase().includes(term) && // Cambio a name_data
        !attempts.some(att => att.name === char.name_data)
      )
      .slice(0, 5);
  }, [searchTerm, catalog, attempts]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="system-panel w-full max-w-4xl h-[75vh] flex flex-col rounded-none border-t-2 border-b-2 relative overflow-hidden">
        
        {/* HUD Decoration */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-system-glow opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-system-glow opacity-50 pointer-events-none" />
        
        {/* Header */}
        <div className="p-5 border-b border-system-glow/20 flex justify-between items-center bg-system-glow/5">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-system-glow/10 border border-system-glow/30">
              <Target className="w-6 h-6 system-text animate-pulse" />
            </div>
            <div>
              <h2 className="font-system text-2xl tracking-widest system-text uppercase leading-none">
                Misión Diaria: Identificación
              </h2>
              <div className="flex gap-4 mt-1">
                <span className="font-mono text-[10px] text-system-glow/60 uppercase">Estado: {isWon ? 'Completado' : 'En progreso'}</span>
                <span className="font-mono text-[10px] text-system-glow/60 uppercase">Intentos: {attempts.length}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="system-text hover:text-white transition-all text-2xl p-2 hover:bg-system-glow/10">✕</button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-6">
          
          {/* Buscador de Sistema */}
          {!isWon && (
            <div className="relative z-20">
              <div className="flex items-center gap-3 bg-system-glow/5 border border-system-glow/20 p-1 rounded-sm focus-within:border-system-glow/60 transition-all">
                <Search className="w-5 h-5 ml-3 system-text opacity-50" />
                <input 
                  type="text"
                  value={searchTerm}
                  disabled={mutation.isPending}
                  placeholder={mutation.isPending ? "ANALIZANDO BASE DE DATOS..." : "ESCANEAR SUJETO..."}
                  className="w-full bg-transparent p-3 text-white font-data placeholder:text-system-glow/30 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {filteredCharacters.length > 0 && (
                <div className="absolute w-full mt-2 system-panel border-system-glow/40 shadow-2xl animate-in slide-in-from-top-2 bg-black/90">
                  {filteredCharacters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => mutation.mutate(char.id)}
                      className="w-full flex items-center p-3 hover:bg-system-glow/20 border-b border-system-glow/10 last:border-none group transition-all"
                    >
                      <div className="w-12 h-12 border border-system-glow/30 overflow-hidden bg-black">
                         <img 
                            src={getAssetUrl(char.image_key)} 
                            alt={char.name_data} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                            onError={(e) => {
                              e.currentTarget.src = "/default.png"; // Ruta absoluta en public
                            }}  
                          />
                            
                      </div>
                      <span className="ml-4 font-system text-sm system-text uppercase group-hover:text-white">
                        {char.name_data}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensaje de Victoria Estilo Sistema */}
          {isWon && (
            <div className="system-glass border-system-green/50 p-6 text-center animate-pulse-glow">
              <h3 className="font-system text-3xl text-system-green tracking-tighter">¡OBJETIVO CONFIRMADO!</h3>
              <p className="font-data text-system-green/70 text-sm mt-2">Los datos del sujeto han sido sincronizados correctamente.</p>
            </div>
          )}

          {/* Tabla con Scroll Interno Personalizado */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isLoadingStatus ? (
               <div className="flex flex-col justify-center items-center h-60 gap-4">
                  <Loader2 className="w-10 h-10 system-text animate-spin" />
                  <span className="font-system system-text text-sm animate-pulse">Sincronizando con el servidor...</span>
               </div>
            ) : (
              <div className="space-y-4">
                {/* Cabecera de Tabla */}
                <div className="grid grid-cols-6 gap-3 text-[10px] font-system system-text text-center border-b border-system-glow/20 pb-3">
                  <div>Sujeto</div>
                  <div>Raza</div>
                  <div>Rango</div>
                  <div>Clase</div>
                  <div>Afiliación</div>
                  <div>Match</div>
                </div>

                {/* Lista de Intentos */}
                {attempts.map((attempt, index) => (
                  <div key={index} className="grid grid-cols-6 gap-3 animate-fade-in-up">
                    <div className="h-24 system-glass border-system-glow/20 flex flex-col items-center justify-center relative overflow-hidden group">
                        <img 
                            src={getAssetUrl(attempt.image_key)} 
                            alt={attempt.name} 
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all" 
                            onError={(e) => {
                              e.currentTarget.src = "/default.png"; // Ruta absoluta en public
                            }} 
                          />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <span className="absolute bottom-2 font-data text-[9px] text-white uppercase text-center px-1 leading-tight">{attempt.name}</span>
                    </div>
                    
                    <AttributeCell match={attempt.race} /> 
                    <AttributeCell match={attempt.rank} />
                    <AttributeCell match={attempt.class} />
                    <AttributeCell match={attempt.affiliation} />
                    
                    <div className={`h-24 flex items-center justify-center border transition-all duration-700 ${
                      attempt.race.result === 'correct' && 
                      attempt.rank.result === 'correct' && 
                      attempt.class.result === 'correct' && 
                      attempt.affiliation.result === 'correct' 
                      ? 'bg-system-green/20 border-system-green shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-system-red/10 border-system-red/30'}`}>
                        {attempt.race.result === 'correct' && attempt.rank.result === 'correct' && attempt.class.result === 'correct' && attempt.affiliation.result === 'correct' ? 
                          <Check className="w-10 h-10 text-system-green drop-shadow-[0_0_8px_currentColor]" /> : 
                          <Ban className="w-8 h-8 text-system-red/40" />
                        }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

// Celdas estilizadas como pequeñas pantallas de datos
const AttributeCell = ({ match }: { match: AttributeComparison }) => {
  const styles = {
    correct: 'bg-system-green/60 border-system-green text-white text-glow-strong',
    incorrect: 'bg-system-red/20 border-system-red/40 text-system-red/70',
    higher: 'bg-system-gold/40 border-system-gold text-white animate-pulse-glow',
    lower: 'bg-system-gold/40 border-system-gold text-white animate-pulse-glow',
    partial: 'bg-system-gold/60 border-system-gold/80 text-black font-bold'
  };

  return (
    <div className={`h-24 flex flex-col items-center justify-center border p-2 text-center transition-all duration-500 ${styles[match.result] || styles.incorrect}`}>
      {/* match.value ahora es directamente el string (ej: "Humano") */}
      <span className="font-data text-[10px] uppercase tracking-tighter leading-tight">{match.value.es}</span>
      <div className="mt-2">
        {match.result === 'higher' && <ArrowUp className="w-5 h-5 system-text" />}
        {match.result === 'lower' && <ArrowDown className="w-5 h-5 system-text" />}
        {match.result === 'correct' && <div className="w-1 h-1 bg-white rounded-full animate-ping" />}
      </div>
    </div>
  );
};

export default DleModal;