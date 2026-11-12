import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import PublicLayout from '@/components/layout/PublicLayout';
import ScrollToTop from '@/components/layout/ScrollToTop';
import Home from '@/pages/Home';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

// The admin screens are downloaded only when someone opens them, so visitors
// who just want a recipe never pay for the dashboard and the recipe editor.
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const RecipeForm = lazy(() => import('@/pages/admin/RecipeForm'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-dvh bg-bg" />}>
                <Routes>
                  {/* Admin: its own frame, which also checks the login */}
                  <Route path="/admin/login" element={<Login />} />
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/new" element={<RecipeForm />} />
                    <Route path="/admin/edit/:id" element={<RecipeForm />} />
                  </Route>

                  {/* Public pages share one layout */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/recipes/:id" element={<RecipeDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
