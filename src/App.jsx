import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import PropertiesPage from "./pages/admin/PropertiesPage.jsx";
import ClientsPage from "./pages/admin/ClientsPage.jsx";
import DealsPage from "./pages/admin/DealsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/qeydiyyat" element={<Auth />} />
      <Route path="/giris" element={<Auth />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="properties" replace />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="deals" element={<DealsPage />} />
      </Route>
    </Routes>
  );
}
