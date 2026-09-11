import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import PublicLayout from "./layouts/PublicLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import CustomerRoute from "./routes/CustomerRoute";
import AdminRoute from "./routes/AdminRoute";

import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import ProductDetail from "./pages/public/ProductDetail";
import Cart from "./pages/public/Cart";
import Register from "./pages/public/Register";
import Login from "./pages/public/Login";
import ForgotPassword from "./pages/public/ForgotPassword";
import Checkout from "./pages/public/Checkout";
import OrderConfirmation from "./pages/public/OrderConfirmation";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerOrders from "./pages/customer/Orders";
import CustomerOrderDetail from "./pages/customer/OrderDetail";
import CustomerProfile from "./pages/customer/Profile";
import CustomerSecurity from "./pages/customer/Security";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminCustomers from "./pages/admin/Customers";
import AdminCustomerDetail from "./pages/admin/CustomerDetail";
import AdminProducts from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import AdminCategories from "./pages/admin/Categories";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public site */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/produits" element={<Catalog />} />
                <Route path="/produits/:id" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/inscription" element={<Register />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
                <Route path="/commande" element={<Checkout />} />
                <Route path="/commande/confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Customer space */}
              <Route
                path="/mon-compte"
                element={
                  <CustomerRoute>
                    <CustomerLayout />
                  </CustomerRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
                <Route path="commandes" element={<CustomerOrders />} />
                <Route path="commandes/:id" element={<CustomerOrderDetail />} />
                <Route path="profil" element={<CustomerProfile />} />
                <Route path="securite" element={<CustomerSecurity />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/connexion" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="commandes/:id" element={<AdminOrderDetail />} />
                <Route path="clients" element={<AdminCustomers />} />
                <Route path="clients/:id" element={<AdminCustomerDetail />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="produits/nouveau" element={<ProductForm />} />
                <Route path="produits/:id/modifier" element={<ProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
