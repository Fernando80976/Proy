import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

const PreLoader = ({ message }: Props) => {
  const { t } = useTranslation();
  return (
    
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 text-center">
      
    
      <Loader2 className="size-10 animate-spin text-system-glow md:size-16" />
      
    
      <p className="max-w-[80%] font-mono text-sm uppercase tracking-[0.2em] text-system-glow animate-pulse md:text-lg">
        {message ?? t('common.loading')}
      </p>
    </div>
  );
};

export default PreLoader;