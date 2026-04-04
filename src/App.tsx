import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Factory, 
  Truck, 
  Store, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  QrCode, 
  History as HistoryIcon, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Pages
import HomePage from './pages/HomePage';
import VerificationPage from './pages/VerificationPage';
import ManufacturerPage from './pages/ManufacturerPage';
import SupplyChainPage from './pages/SupplyChainPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role as UserRole);
        } else {
          // Create default profile
          const defaultProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: UserRole.CUSTOMER,
            organizationName: '',
            gln: ''
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
          setUserRole(UserRole.CUSTOMER);
        }
      } else {
        setUser(null);
        setUserRole(UserRole.GUEST);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">AuthenTick</span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <Link to="/verify" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Verify Product</Link>
                {(userRole === UserRole.MANUFACTURER || userRole === UserRole.GUEST) && (
                  <Link to="/manufacturer" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Manufacturer</Link>
                )}
                {(userRole === UserRole.DISTRIBUTOR || userRole === UserRole.RETAILER || userRole === UserRole.GUEST) && (
                  <Link to="/supply-chain" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Supply Chain</Link>
                )}
                
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{userRole}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 hover:text-indigo-600">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex flex-col gap-4 p-4">
                <Link to="/verify" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-600">Verify Product</Link>
                <Link to="/manufacturer" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-600">Manufacturer</Link>
                <Link to="/supply-chain" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-600">Supply Chain</Link>
                {user ? (
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-base font-medium text-red-500">Logout</button>
                ) : (
                  <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="text-left text-base font-medium text-indigo-600">Login</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/manufacturer" element={<ManufacturerPage />} />
            <Route path="/supply-chain" element={<SupplyChainPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                  <span className="text-lg font-bold">AuthenTick</span>
                </div>
                <p className="text-sm text-slate-500 max-w-xs">
                  Securing global supply chains through blockchain-based digital twins and ZK-privacy.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-400">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600">Documentation</a></li>
                  <li><a href="#" className="hover:text-indigo-600">API Reference</a></li>
                  <li><a href="#" className="hover:text-indigo-600">GS1 EPCIS Standard</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-400">Company</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
                  <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} AuthenTick. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
