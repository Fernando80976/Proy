// src/utils/assets.ts

/**
 * Función centralizada para obtener la URL pública de cualquier archivo en Supabase.
 * @param path Ruta relativa dentro de tu bucket (ej: 'characters/hero.png')
 */
export const getAssetUrl = (path: string): string => {
  // Obtenemos los valores de forma segura desde las variables de entorno
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const bucket = import.meta.env.VITE_BUCKET_NAME;

  // Validación rápida: si no hay path, evitamos que la URL se rompa
  if (!path) {
    return "/default.png"; // Imagen que debes tener en tu carpeta public
  }

  // Retornamos la URL completa construida
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
};