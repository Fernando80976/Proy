import apiClient from "../api/ApiClient";

// Interfaces para que React Query "sepa" qué recibe
export interface AuthResponse {
  status: string;      // "success" o "error"
  mensaje: string;     // Nuestro nuevo estándar
  username?: string;
  endpoint?: string;   // Por si quieres usarlo en el front
}

export interface LoginData {
  identifier: string;
  password?: string; // Opcional si usas otros métodos
}

export interface RegisterData {
  email: string;
  username: string;
  password?: string;
}

// Exportamos un objeto con las funciones
export const authService = {
  // Optimizamos devolviendo directamente response.data
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data; 
  },

  signup: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get("/auth/verify");
      return true;
    } catch (err) {
      console.error("Error al verificar el token:", err);
      return false;
    }
  }
  
};