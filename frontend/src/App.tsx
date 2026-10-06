import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/context/ToastContext";
import { WalletProvider } from "@/context/WalletContext";
import { DemoProvider } from "@/context/DemoContext";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
const VerifyPage = lazy(() => import("@/pages/VerifyPage"));
const ManufacturerPage = lazy(() => import("@/pages/ManufacturerPage"));
const SupplyChainPage = lazy(() => import("@/pages/SupplyChainPage"));
const ProductDetailsPage = lazy(() => import("@/pages/ProductDetailsPage"));
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const DocsPage = lazy(() => import("@/pages/DocsPage"));
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ToastProvider>
      <DemoProvider>
      <WalletProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="route-loading" role="status">Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/manufacturer" element={<ManufacturerPage />} />
              <Route path="/supply-chain" element={<SupplyChainPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
      </WalletProvider>
      </DemoProvider>
    </ToastProvider>
  );
}
