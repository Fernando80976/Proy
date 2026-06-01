import { type Step, type ButtonType } from 'react-joyride';

export const getSystemTutorialSteps = (t: (key: string, defaultValue?: string) => string, width: number): Step[] => {
  const isMobileMenu = width < 1280; 
  const isMobileStats = width < 1024; 

  // Configuración base que queremos que compartan todos los pasos
  const stepButtons: ButtonType[] = ['back', 'skip', 'primary'];
  const stepBaseConfig = {
    disableBeacon: true,
    buttons: stepButtons,
    continuous: true,
    showProgress: true,
  };

  return [
    // 1. Welcome (center)
    {
      ...stepBaseConfig,
      target: 'body',
      placement: 'center',
      content: t('tutorial.welcome', '¡Bienvenido Cazador! Haz sido escogido por el sistema. Tu objetivo es subir de nivel, mejorar tus atributos y enfrentarte a desafiantes Mazmorras de Instantáneas para convertirte en el mejor Cazador. ¡Vamos a empezar con un rápido recorrido por tu panel de control!'),
    },

    // 2. Menu (hamburger or sidebar)
    {
      ...stepBaseConfig,
      target: isMobileMenu ? '#tutorial-hamburger-btn' : '#tutorial-sidebar-nav',
      placement: isMobileMenu ? 'bottom' : 'right',
      content: isMobileMenu 
        ? t('tutorial.menu_mobile', 'Presiona este botón de acceso rápido para desplegar el Menú del Sistema: Mazmorras, Inventario, Habilidades, la Tienda, las Misiones y el Ranking.')
        : t('tutorial.menu_desktop', 'Este es el Menú del Sistema. Desde aquí podrás acceder a tus Misiones, adentrarte en Mazmorras de Instantáneas o mejorar tus Habilidades, Comprar ítems y equipartelos o usarlos.'),
    },

    // 3. Stats trigger
    {
      ...stepBaseConfig,
      target: isMobileStats ? '#tutorial-stats-trigger-btn' : '#tutorial-desktop-stats',
      placement: 'bottom',
      content: isMobileStats
        ? t('tutorial.stats_mobile', 'Al pulsar este icono de métricas desplegarás tu estatus rápido: Nivel, Oro acumulado y tu porcentaje de Experiencia actual.')
        : t('tutorial.stats_desktop', 'Aquí se monitorizan tus constantes vitales en tiempo real: tu Nombre de Cazador, Nivel actual, el Oro disponible (G) y tu barra de progreso de EXP.'),
    },

    // 4. Title button (do not auto-scroll)
    {
      ...stepBaseConfig,
      target: '#tutorial-title-btn',
      placement: 'bottom',
      skipScroll: true,
      content: t('tutorial.change_title', 'Pulsa aquí para cambiar tu título activo. Los títulos otorgan bonificaciones de estadísticas y se desbloquean por nivel.'),
    },

    // 5. Attributes panel
    {
      ...stepBaseConfig,
      target: '#tutorial-atributos',
      placement: 'top',
      content: t('tutorial.attributes_panel', 'Este panel muestra tus Atributos Básicos. Distribuye tus puntos de estadísticas ganados para aumentar tu poder antes de entrar a una Raid.'),
    },

    // 6. Assign mode
    {
      ...stepBaseConfig,
      target: '#tutorial-modo-asignacion',
      placement: 'bottom',
      content: t('tutorial.assign_mode', 'Puedes configurar el multiplicador de asignación para subir tus atributos de 1 en 1, de 10 en 10 o consumir todos tus puntos con el modificador MAX de golpe.'),
    },

    // 7. Add point button (do not auto-scroll, multiple targets -> highlight without scrolling)
    {
      ...stepBaseConfig,
      target: '.tutorial-add-point',
      placement: 'right',
      skipScroll: true,
      content: t('tutorial.add_point', 'Usa este botón para añadir puntos a un atributo seleccionado. Puedes cambiar el modo de asignación para añadir de 1, 10 o MAX.'),
    },

    // 8. Apply button
    {
      ...stepBaseConfig,
      target: '#tutorial-boton-aplicar',
      placement: 'top',
      content: t('tutorial.apply_changes', '¡Acción crucial! Una vez modificados tus parámetros, presiona este botón para confirmar y que el sistema pueda materializar de forma permanente tu subida de poder.'),
    },
    // (end of steps)
  ];
};