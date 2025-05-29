// src/App.jsx
import { useState } from "react";
import { UserContext } from "./context/UserContext.jsx";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.jsx";
import MePage from "./pages/MePage.jsx";
import "./App.css";
import ProductPage from "./pages/ProductPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import Cart from "./pages/cartPage.jsx";
import Myorders from "./pages/myOrdersPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import UserManagePage from "./pages/admin/usersManagePage.jsx";
import ProductsManagePage from "./pages/admin/productsManagePage.jsx";
import OrdersManagePage from "./pages/admin/ordersManagePage.jsx";
import ReviewsManagePage from "./pages/admin/reviewsManagePage.jsx";
function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/my-orders" element={<Myorders />} />
        <Route path="/product/:slug/:id?" element={<ProductPage />} />
        <Route
          path="/resetPassword/:resetToken"
          element={<ResetPasswordPage />}
        />
        <Route path="/admin" element={<AdminPage />}>
          <Route path="users" element={<UserManagePage />} />
          <Route path="products" element={<ProductsManagePage />} />
          <Route path="orders" element={<OrdersManagePage />} />
          <Route path="reviews" element={<ReviewsManagePage />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
