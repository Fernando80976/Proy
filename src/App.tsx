import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Start from './views/start/Start.tsx';
import Login from './views/auth/Login.tsx';
import GameDashboard from './components/layout/Navbar.tsx'; 
import StatsView from './views/status/Stats.tsx';
import SkillsPanel from './views/skills/Skills.tsx';
import InventoryPanel from './views/inventory/Inventory.tsx';
import ShopPanel from './views/shop/Shop.tsx';
import QuestsPanel from './views/quests/Quests.tsx';
import RankingPanel from './views/ranking/Ranking.tsx';
import DungeonsPanel from './views/dungeons/Dungeons.tsx';
import NotFound from './views/notFound/NotFound.tsx';
import Credits from './views/credits/Credits.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import { ToastProvider } from './context/ToastProvider.tsx';
import ClassSelection from './views/class/ClassSelection.tsx';
import { ClassGuardRoute } from './components/common/ClassGuardRoute.tsx';

// Comando para instalar los paquetes necesarios para el proyecto:
// npm install

// Comando para iniciar el proyecto:
// npm run dev

// Comando para el test del proyecto:
// npm run test

// Comando para sacar estructura de carpetas en windows:
// tree src /F /A > estructura.txt

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/Credits" element={<Credits />} />
        <Route path="/Login" element={<Login />} />


        <Route element={<ProtectedRoute />}>

          <Route element={<ClassGuardRoute requireClass={false} />}>
            <Route path="/Selection" element={<ClassSelection />} />
          </Route>
          
          <Route element={<ClassGuardRoute requireClass={true} />}>
            <Route path="/Game" element={<GameDashboard />}>

              <Route index element={<Navigate to="/Game/Status" replace />} />
              
              <Route path="Status" element={<StatsView />} />
              <Route path="Quests" element={<QuestsPanel />} />
              <Route path="Dungeons" element={<DungeonsPanel />} />
              <Route path="Inventory" element={<InventoryPanel />} />
              <Route path="Skills" element={<SkillsPanel />} />
              <Route path="Shop" element={<ShopPanel />} />
              <Route path="Ranking" element={<RankingPanel />} />
              
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastProvider />
    </>
    
  );
}

export default App;