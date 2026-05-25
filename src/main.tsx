import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/theme/ThemeProvider.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/QueryClient.ts'
import { SystemNotifyProvider } from './context/notifications/SystemNotifyProvider.tsx'
import { AxiosInterceptor } from './api/AxiosInterceptor';
import App from './App.tsx'

import './i18n/config.ts'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SystemNotifyProvider>
          <BrowserRouter>
            <AxiosInterceptor>
              <App />
            </AxiosInterceptor>
          </BrowserRouter>
        </SystemNotifyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)