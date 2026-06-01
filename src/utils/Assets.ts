export const getAssetUrl = (path: string | undefined | null, theme: 'blue' | 'purple' = 'blue'): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const bucket = import.meta.env.VITE_BUCKET_NAME;

  if (!path) {
    return theme === 'purple' ? '/default_purple.png' : '/default_blue.png';
  }

  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
};