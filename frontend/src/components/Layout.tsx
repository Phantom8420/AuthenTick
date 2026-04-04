import { Link, Outlet, useLocation } from "react-router-dom";
import { Shield, QrCode, Factory, Truck, Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/verify", label: "Verify", icon: QrCode },
  { path: "/manufacturer", label: "Manufacturer", icon: Factory },
  { path: "/supply-chain", label: "Supply Chain", icon: Truck },
];

export function Layout() {
  const { account, connectWallet, disconnect } = useWallet();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight group">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-900 border border-slate-800 text-electric-blue shadow-lg transition-all group-hover:border-electric-blue group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Shield className="h-6 w-6" />
            </span>
            AuthenTick
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link 
                key={path} 
                to={path} 
                className={`flex items-center gap-2 transition-colors hover:text-slate-50 ${location.pathname === path ? "text-electric-blue" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            
            <div className="ml-4 flex items-center border-l border-slate-800 pl-6">
              {account ? (
                <div className="flex items-center gap-3">
                  <span className="max-w-[140px] truncate rounded-full bg-slate-900 border border-slate-800 px-3 py-1 font-mono text-xs text-slate-300">
                    {account}
                  </span>
                  <Button variant="outline" className="px-3 py-1.5 text-xs h-auto min-h-0" onClick={() => disconnect()} title="Disconnect">
                    <LogOut className="h-4 w-4 mr-1" /> Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="primary" className="px-4 py-1.5 text-xs h-auto min-h-0 rounded-full" onClick={() => void connectWallet()}>
                  <Wallet className="h-4 w-4 mr-2" /> Connect
                </Button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-sm text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-medium text-slate-400">AuthenTick</p>
          <p>Product Verification Platform • Immutable Provenance</p>
        </div>
      </footer>
    </div>
  );
}
