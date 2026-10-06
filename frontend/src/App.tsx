import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/context/ToastContext";
import { WalletProvider } from "@/context/WalletContext";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import VerifyPage from "@/pages/VerifyPage";
import ManufacturerPage from "@/pages/ManufacturerPage";
import SupplyChainPage from "@/pages/SupplyChainPage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/manufacturer" element={<ManufacturerPage />} />
              <Route path="/supply-chain" element={<SupplyChainPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </ToastProvider>
  );
}
