import type { Styles, Options } from 'react-joyride';


export const joyrideOptions: Partial<Options> = {
  primaryColor: 'hsl(var(--system-glow))',
  backgroundColor: 'hsl(var(--background))',
  overlayColor: 'rgba(0,0,0,0.75)',
  textColor: '#ffffff',
  arrowColor: 'hsl(var(--system-glow))',
  width: 340,
  zIndex: 10000,
  buttons: ['back', 'skip', 'primary'],
};

export const joyrideStyles: Partial<Styles> = {
  tooltipContainer: {
    textAlign: 'left',
    fontFamily: 'monospace',
    background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.95) 100%)',
    color: 'white',
    border: '1px solid hsl(var(--system-glow) / 0.4)',
    borderRadius: '12px',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 24px hsl(var(--system-glow) / 0.35)',
    padding: '20px 22px'
  },
  buttonPrimary: {
    backgroundColor: 'hsl(var(--system-glow) / 0.18)',
    color: 'hsl(var(--system-glow))',
    border: '1px solid hsl(var(--system-glow) / 0.45)',
    borderRadius: '6px',
    textTransform: 'uppercase',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  buttonBack: {
    color: 'hsl(var(--system-glow) / 0.85)',
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  buttonSkip: {
    color: 'hsl(var(--system-glow) / 0.75)',
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  beaconWrapper: {
    boxShadow: '0 0 20px hsl(var(--system-glow) / 0.5), 0 0 40px hsl(var(--system-glow) / 0.25)'
  },
  spotlight: {
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 2.5,
    opacity: 0.98,
    filter: 'drop-shadow(0 0 8px white)'
  },
  tooltipTitle: {
    color: 'hsl(var(--system-glow))',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  tooltipContent: {
    color: '#e0e0e0',
    fontSize: '13px',
    lineHeight: '1.6'
  },
  floater: {
    zIndex: 10000
  }
};
