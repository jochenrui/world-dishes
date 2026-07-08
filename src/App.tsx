import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DishSpriteSheet } from './components/DishSprites';
import { PopularPage } from './pages/PopularPage';
import { CollectionPage } from './pages/CollectionPage';
import { CountryPage } from './pages/CountryPage';
import { DishPage } from './pages/DishPage';
import { AboutPage } from './pages/AboutPage';
import { SessionProvider } from './state/SessionContext';
import { ProgressProvider } from './state/ProgressContext';

export function App() {
  return (
    <SessionProvider>
      <ProgressProvider>
        <DishSpriteSheet />
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<PopularPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="collection/:countryId" element={<CountryPage />} />
            <Route path="dish/:dishId" element={<DishPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProgressProvider>
    </SessionProvider>
  );
}
