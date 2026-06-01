import { useTheme } from "../context/theme/ThemeContext";
import { getAssetUrl } from "../utils/Assets";

export const useAsset = () => {
  const { theme } = useTheme();
  return (path: string | undefined | null) => getAssetUrl(path, theme);
};