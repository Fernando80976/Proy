import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Swords, Eye, EyeOff, ShieldAlert, User, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/AuthService';
import Preloader from '../../components/common/Preloader';
import { classService } from '../../services/ClassService';

interface ErroresValidacion {
  identifier?: string;
  username?: string;
  password?: string;
}

const crearParticulas = () => {
  return Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
  }));
};

const ErrorMensaje = ({ mensaje, visible }: { mensaje?: string; visible: boolean }) => {
  return (
    <div 
      className={`grid transition-all duration-300 ease-in-out ${
        visible && mensaje ? 'grid-rows-[1fr] mt-2 opacity-100' : 'grid-rows-[0fr] mt-0 opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <p className="text-xs md:text-sm text-red-400 font-data font-semibold bg-red-950/30 p-2.5 rounded border border-system-red/30 animate-flash-red">
          {mensaje}
        </p>
      </div>
    </div>
  );
};

const formVariants = {
  hidden: { opacity: 0, x: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }
} as const;

const Login = () => {
  const { t } = useTranslation();
  const [errores, setErrores] = useState<ErroresValidacion>({});
  const [identifier, setIdentifier] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loadingSource, setLoadingSource] = useState<"email" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSystem, setShowSystem] = useState<boolean>(false);
  const [mensajeAutoLogin, setMensajeAutoLogin] = useState<string>(t('auth.loading_auth'));
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [partículasFondo] = useState(crearParticulas);
  
  const navigate = useNavigate();
  const [formEnviado, setFormEnviado] = useState<boolean>(false);

  const tieneOchoCaracteres = password.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);
  const passwordValido = tieneOchoCaracteres && tieneMayuscula && tieneNumero;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const identifierValido = isSignUp ? emailRegex.test(identifier) : identifier.trim().length > 0;
  const usernameValido = !isSignUp || username.trim().length >= 3;

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.verifyToken();
      
      if (isAuthenticated) {
        const hasClass = await classService.verifyClass();
        if (!hasClass) {
          navigate('/Selection', { replace: true, state: { skipCheck: true } });
          return;
        }
        setMensajeAutoLogin(t('auth.loading_sync'));
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/Game/Status', { replace: true, state: { skipCheck: true } });
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate, t]);

  const validarFormulario = () => {
    const nuevosErrores: ErroresValidacion = {};

    if (!identifier.trim()) {
      nuevosErrores.identifier = t('auth.error_empty_field');
    } else if (isSignUp && !emailRegex.test(identifier)) {
      nuevosErrores.identifier = t('auth.error_invalid_email_format');
    }

    if (isSignUp && username.trim().length < 3) {
      nuevosErrores.username = t('auth.error_username_short');
    }

    if (!passwordValido) {
      nuevosErrores.password = t('auth.error_password_invalid');
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFormEnviado(true);

    if (!validarFormulario()) return;

    setError('');
    setLoadingSource('email');

    try {
      if (isSignUp) {
        await authService.signup({ email: identifier, password, username });
        navigate('/Selection', { state: { skipCheck: true, hasAssignedClass: false } });
      } else {
        await authService.login({ identifier, password });
        if ((await classService.verifyClass()) === false) {
          navigate('/Selection', { state: { skipCheck: true } });
          return;
        }
        navigate('/Game/Status', { state: { skipCheck: true, classConfirmed: true } });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.mensaje || err.response?.data?.detail;
        setError(t(`backend_errors.${errorCode}`) || t('auth.error_connection'));
      } else {
        setError(t('auth.error_unexpected'));
      }
      setLoadingSource(null);
    }
  };

  const obtenerClaseRequisito = (cumplido: boolean) => {
    if (cumplido) return 'text-system-green font-bold text-glow-green tracking-wide animate-pulse';
    if (formEnviado) return 'text-system-red font-bold text-glow-red bg-system-red/10 px-2 py-1 rounded border border-system-red/30 transition-all duration-300 tracking-wide';
    return 'text-muted-foreground/90 font-medium tracking-wide';
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-6">
        <Preloader message={mensajeAutoLogin} />
      </div>
    );
  }

  if (loadingSource) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-6">
        <Preloader message={t('auth.loading_identity')} />
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-background relative overflow-y-hidden font-sans select-none px-4 py-8 md:py-12">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {partículasFondo.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-system-glow/30 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              contentVisibility: 'auto'
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/30 to-transparent h-40 animate-scan-line" />
      </div>

      <motion.div 
        layout
        className={`relative z-10 w-full max-w-md lg:max-w-xl mx-auto transition-all duration-700 ${showSystem ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        
        <div className="absolute -top-1 -left-1 w-4 h-4 md:w-6 md:h-6 border-t-2 border-l-2 border-system-glow z-20" />
        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 border-t-2 border-r-2 border-system-glow z-20" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 md:w-6 md:h-6 border-b-2 border-l-2 border-system-glow z-20" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-6 md:h-6 border-b-2 border-r-2 border-system-glow z-20" />

        <div className="system-panel rounded-lg p-5 sm:p-8 md:p-10 backdrop-blur-md relative border border-system-glow/20 bg-background/40 shadow-2xl overflow-hidden">
          
          {/* Cabecera del Panel */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-2">
              <Swords className="w-6 h-6 md:w-8 md:h-8 shrink-0 text-system-glow animate-float" />
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={isSignUp ? 'reg-title' : 'login-title'}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-5xl font-mono font-black tracking-widest system-text text-glow-strong break-words"
                >
                  {isSignUp ? t('auth.register') : t('auth.login')}
                </motion.h1>
              </AnimatePresence>
              <Swords className="w-6 h-6 md:w-8 md:h-8 shrink-0 text-system-glow animate-float" />
            </div>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-system-glow/40 to-transparent my-3" />
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={isSignUp ? 'reg-sub' : 'login-sub'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground font-mono text-[10px] sm:text-xs md:text-sm tracking-wider uppercase font-semibold px-2 balance"
              >
                {isSignUp ? t('auth.register_description') : t('auth.login_description')}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isSignUp ? 'register-form' : 'login-form'}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit} 
              className="flex flex-col gap-4" 
              noValidate
            >

              {error && (
                <div className="text-xs md:text-sm text-red-400 bg-red-950/50 border-l-4 border-system-red p-3 font-data rounded flex items-start gap-3 shadow-md">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-system-red mt-0.5" />
                  <div className="break-words max-w-full">
                    <span className="font-bold uppercase text-system-red block mb-0.5">[WARNING]:</span> {error}
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="text-[11px] md:text-xs font-mono font-bold text-system-glow tracking-wider uppercase flex items-center gap-2">
                    <User className="w-3.5 h-3.5 shrink-0" /> {t('auth.label_username')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      // autoComplete="off"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value); 
                        if (formEnviado) setFormEnviado(false);
                      }}
                      required
                      className={`w-full bg-background/95 border rounded p-2.5 md:p-3 text-sm md:text-base text-foreground font-sans placeholder-muted-foreground/70 focus:ring-1 focus:outline-none transition-all shadow-inner ${
                        formEnviado && !usernameValido 
                          ? 'border-system-red focus:border-system-red focus:ring-system-red/30' 
                          : 'border-system-glow/30 focus:border-system-glow focus:ring-system-glow/30'
                      }`}
                      placeholder={t('auth.label_username')}
                    />
                  </div>
                  <ErrorMensaje mensaje={errores.username} visible={formEnviado && !!errores.username} />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="identifier" className="text-[11px] md:text-xs font-mono font-bold text-system-glow tracking-wider uppercase flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {isSignUp ? t('auth.label_access_key') : t('auth.label_identifier')}
                </label>
                <input
                  type={isSignUp ? "email" : "text"}
                  id="identifier"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (formEnviado) setFormEnviado(false);
                  }}
                  required
                  className={`w-full bg-background/95 border rounded p-2.5 md:p-3 text-sm md:text-base text-foreground font-sans placeholder-muted-foreground/70 focus:ring-1 focus:outline-none transition-all shadow-inner ${
                    formEnviado && !identifierValido 
                      ? 'border-system-red focus:border-system-red focus:ring-system-red/30' 
                      : 'border-system-glow/30 focus:border-system-glow focus:ring-system-glow/30'
                  }`}
                  placeholder={isSignUp ? "hunter@system.com" : t('auth.placeholder_credentials')}
                />
                <ErrorMensaje mensaje={errores.identifier} visible={formEnviado && !!errores.identifier} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[11px] md:text-xs font-mono font-bold text-system-glow tracking-wider uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" /> {t('auth.label_access_key')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formEnviado) setFormEnviado(false);
                    }}
                    required
                    className={`w-full bg-background/95 border rounded p-2.5 md:p-3 pr-10 md:pr-12 text-sm md:text-base text-foreground font-sans placeholder-muted-foreground/70 focus:ring-1 focus:outline-none transition-all shadow-inner ${
                      formEnviado && !passwordValido 
                        ? 'border-system-red focus:border-system-red focus:ring-system-red/30' 
                        : 'border-system-glow/30 focus:border-system-glow focus:ring-system-glow/30'
                    }`}
                    placeholder={t('auth.label_access_key')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-system-glow transition-colors p-1"
                    aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <ErrorMensaje mensaje={errores.password} visible={formEnviado && !!errores.password} />

                <div className="mt-1 bg-muted/30 border border-border/60 rounded-lg p-2.5 md:p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 font-data font-bold text-[11px] md:text-xs select-none">
                  <div className={`flex items-center gap-1.5 transition-all duration-300 ${obtenerClaseRequisito(tieneOchoCaracteres)}`}>
                    {tieneOchoCaracteres ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-system-green" /> : <XCircle className={`w-3.5 h-3.5 shrink-0 ${formEnviado ? 'text-system-red' : 'text-muted-foreground/60'}`} />}
                    <span>{t('auth.password_requirement_length')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-all duration-300 ${obtenerClaseRequisito(tieneMayuscula)}`}>
                    {tieneMayuscula ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-system-green" /> : <XCircle className={`w-3.5 h-3.5 shrink-0 ${formEnviado ? 'text-system-red' : 'text-muted-foreground/60'}`} />}
                    <span>{t('auth.password_requirement_uppercase')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-all duration-300 ${obtenerClaseRequisito(tieneNumero)}`}>
                    {tieneNumero ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-system-green" /> : <XCircle className={`w-3.5 h-3.5 shrink-0 ${formEnviado ? 'text-system-red' : 'text-muted-foreground/60'}`} />}
                    <span>{t('auth.password_requirement_number')}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loadingSource !== null} 
                className="w-full mt-2 py-2.5 md:py-3 rounded font-mono font-black text-base md:text-lg tracking-widest bg-gradient-to-r from-system-glow/10 to-system-glow/20 border border-system-glow/60 text-system-glow hover:from-system-glow/20 hover:to-system-glow/30 hover:border-system-glow text-glow-strong shadow-[0_0_15px_rgba(0,242,255,0.1)] hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] transition-all cursor-pointer active:scale-[0.99] disabled:opacity-40"
              >
                {loadingSource === 'email' ? t('auth.loading_identity') : (isSignUp ? t('auth.register') : t('auth.button_arise'))}
              </button>

            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-center border-t border-system-glow/10 pt-4">
            <button 
              type="button"
              onClick={() => {
                const valorActual = identifier.trim();
                if (!isSignUp) {
                  if (valorActual && !valorActual.includes('@')) {
                    setUsername(valorActual);
                    setIdentifier('');
                  } else {
                    setUsername('');
                  }
                } else {
                  if (username.trim()) {
                    setIdentifier(username.trim());
                  }
                  setUsername('');
                }
                setIsSignUp(!isSignUp);
                setError('');
                setErrores({});
                setFormEnviado(false);
              }}
              className="text-muted-foreground hover:text-system-glow font-mono text-xs md:text-sm transition-colors uppercase tracking-wider cursor-pointer p-2 hover:underline decoration-system-glow font-semibold inline-block max-w-full break-words"
            >
              {isSignUp 
                ? t('auth.button_toggle_login') 
                : t('auth.button_toggle_register')}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;