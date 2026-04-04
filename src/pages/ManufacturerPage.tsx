import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Factory, Plus, Package, Database, Shield, CheckCircle2, ChevronRight, QrCode as QrIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function ManufacturerPage() {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedProduct, setMintedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    gtin: '',
    serial: '',
    batchId: '',
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }
    setIsMinting(true);

    try {
      // Simulate blockchain minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nftId = `0x${Math.random().toString(16).substr(2, 40)}`;
      const productData = {
        id: nftId,
        name: formData.name,
        gtin: formData.gtin,
        serial: formData.serial,
        batchId: formData.batchId,
        manufacturer: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        currentOwner: auth.currentUser.uid,
        status: 'PRODUCTION',
      };

      // Save to Firestore
      const productRef = doc(db, 'products', nftId);
      await setDoc(productRef, productData);

      // Add initial EPCIS event
      const eventId = Math.random().toString(36).substr(2, 9);
      const eventRef = doc(collection(productRef, 'events'), eventId);
      await setDoc(eventRef, {
        id: eventId,
        productId: nftId,
        type: 'OBJECT_EVENT',
        action: 'ADD',
        bizStep: 'commissioning',
        disposition: 'active',
        readPoint: 'GLN-FACTORY-001',
        eventTime: serverTimestamp(),
        recordedTime: serverTimestamp(),
        actor: auth.currentUser.uid
      });

      setMintedProduct({
        ...formData,
        nftId,
        mintedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manufacturer Portal</h1>
          <p className="text-slate-600">Mint digital twins and manage product lifecycles.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-bold text-slate-700">Polygon Mainnet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Minting Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Plus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Mint Digital Twin</h2>
            </div>

            <form onSubmit={handleMint} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Luxury Watch Model X"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">GS1 GTIN</label>
                  <input 
                    required
                    type="text" 
                    placeholder="14-digit GTIN"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.gtin}
                    onChange={(e) => setFormData({...formData, gtin: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Serial Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Unique Serial"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.serial}
                    onChange={(e) => setFormData({...formData, serial: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batch ID</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Production Batch"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.batchId}
                    onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                  />
                </div>
              </div>

              <button 
                disabled={isMinting}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                {isMinting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Minting on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Mint Digital Twin (NFT)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Stats & Recent */}
        <div className="space-y-8">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-6">Production Stats</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold">1,284</div>
                <div className="text-[10px] opacity-60 uppercase font-bold mt-1">Total Minted</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-[10px] opacity-60 uppercase font-bold mt-1">Authenticity</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Recent Mints</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-white flex items-center justify-center">
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Batch #8291</div>
                      <div className="text-[10px] text-slate-500">12 mins ago</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minting Result Modal */}
      <AnimatePresence>
        {mintedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-emerald-500 p-10 text-center text-white">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Successfully Minted</h2>
                <p className="opacity-80">Digital Twin is now live on Polygon Mainnet</p>
              </div>
              
              <div className="p-10">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <QRCodeSVG value={mintedProduct.nftId} size={150} />
                    <div className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure QR Code</div>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NFT Token ID</div>
                      <div className="font-mono text-xs break-all bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        {mintedProduct.nftId}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GTIN</div>
                        <div className="font-bold text-sm">{mintedProduct.gtin}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial</div>
                        <div className="font-bold text-sm">{mintedProduct.serial}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setMintedProduct(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                  <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    Download QR Label
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
