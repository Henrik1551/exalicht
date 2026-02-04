import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Configurator from "./pages/Configurator";
import ConfiguratorRoundComplete from "./pages/configurator/RoundComplete";
import ConfiguratorSquareComplete from "./pages/configurator/SquareComplete";
import ConfiguratorRoundShell from "./pages/configurator/RoundShell";
import ConfiguratorSquareShell from "./pages/configurator/SquareShell";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminImport from "./pages/admin/Import";
import AdminConfiguratorImport from "./pages/admin/ConfiguratorImport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/configurator" element={<Configurator />} />
                <Route path="/configurator/rund-komplett" element={<ConfiguratorRoundComplete />} />
                <Route path="/configurator/quadrat-komplett" element={<ConfiguratorSquareComplete />} />
                <Route path="/configurator/rund-kuppel" element={<ConfiguratorRoundShell />} />
                <Route path="/configurator/quadrat-kuppel" element={<ConfiguratorSquareShell />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes - Protected */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute requireAdmin>
                    <AdminProducts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/import" element={
                  <ProtectedRoute requireAdmin>
                    <AdminImport />
                  </ProtectedRoute>
                } />
                <Route path="/admin/configurator-import" element={
                  <ProtectedRoute requireAdmin>
                    <AdminConfiguratorImport />
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
