const WS_URL = import.meta.env.VITE_WS_URL;

export const createSocket = (path: string = '') => {
  const socket = new WebSocket(`${WS_URL}${path}`);

  socket.onopen = () => console.log("%c[SYSTEM]: Vínculo de Maná Establecido", "color: #00ff00");
  socket.onclose = () => console.log("%c[SYSTEM]: Vínculo de Maná Perdido", "color: #ff0000");

  return socket;
};