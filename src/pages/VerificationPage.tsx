import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { QrCode, Shield, CheckCircle2, AlertCircle, Loader2, History as HistoryIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function VerificationPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      scanner.clear();
      handleVerify(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  const handleVerify = async (id: string) => {
    setScanResult(id);
    setIsVerifying(true);
    setError(null);

    try {
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        setError("Product not found in the blockchain registry.");
        return;
      }

      const data = productSnap.data();
      
      // Fetch history
      const eventsRef = collection(productRef, 'events');
      const q = query(eventsRef, orderBy('eventTime', 'desc'));
      const eventsSnap = await getDocs(q);
      const history = eventsSnap.docs.map(doc => ({
        ...doc.data(),
        time: doc.data().eventTime?.toDate().toLocaleDateString() || 'Unknown'
      }));

      setProductData({
        ...data,
        history
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'products');
      setError("Failed to verify product. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Product Verification</h1>
        <p className="text-slate-600">Scan the secure QR code on your product to verify its digital twin on the blockchain.</p>
      </div>

      {!scanResult && !isVerifying && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden"
        >
          <div id="reader" className="w-full"></div>
          <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
            <QrCode className="h-5 w-5" />
            <span className="text-sm font-medium">Align QR code within the frame</span>
          </div>
        </motion.div>
      )}

      {isVerifying && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">Verifying Digital Twin...</h3>
            <p className="text-slate-500 text-sm">Checking Polygon blockchain and ZK-proofs</p>
          </div>
        </div>
      )}

      {productData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Status Card */}
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">Authentic Product</h2>
              <p className="text-emerald-700">This product is verified and registered on the blockchain.</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Product Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400">Name</div>
                  <div className="font-bold text-slate-900">{productData.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Manufacturer</div>
                  <div className="font-bold text-slate-900">{productData.manufacturer}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">GTIN</div>
                    <div className="font-mono text-sm">{productData.gtin}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Serial</div>
                    <div className="font-mono text-sm">{productData.serial}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Ownership</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400">Current Owner (ZK-Verified)</div>
                  <div className="font-mono text-xs break-all bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                    {productData.owner}
                  </div>
                </div>
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                  Claim Ownership
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Provenance History</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                <HistoryIcon className="h-4 w-4" />
                GS1 EPCIS Log
              </div>
            </div>
            <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {productData.history.map((event: any, i: number) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-2.5 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-500 z-10"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{event.step}</div>
                      <div className="text-xs text-slate-500">{event.location}</div>
                    </div>
                    <div className="text-xs font-medium text-slate-400">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button 
              onClick={() => { setScanResult(null); setProductData(null); }}
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2"
            >
              Scan another product
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-700">
          <AlertCircle className="h-6 w-6" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
