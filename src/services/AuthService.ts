import apiClient from "../api/ApiClient";


export interface AuthResponse {
  status: string;      
  mensaje: string;     
  username?: string;
  endpoint?: string;   
}

export interface LoginData {
  identifier: string;
  password?: string; 
}

export interface RegisterData {
  email: string;
  username: string;
  password?: string;
}


export const authService = {
  
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