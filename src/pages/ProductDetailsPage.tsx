import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, History as HistoryIcon, User, MapPin, CheckCircle2, ChevronLeft, ExternalLink } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          
          // Fetch history
          const eventsRef = collection(productRef, 'events');
          const q = query(eventsRef, orderBy('eventTime', 'desc'));
          const eventsSnap = await getDocs(q);
          const history = eventsSnap.docs.map(doc => ({
            ...doc.data(),
            step: doc.data().bizStep,
            location: doc.data().readPoint,
            time: doc.data().eventTime?.toDate().toLocaleDateString() || 'Unknown',
            actor: doc.data().actor
          }));

          setProduct({
            ...data,
            history
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Verified Authentic
              </div>
              <div className="text-xs font-mono text-slate-400">ID: {id?.slice(0, 12)}...</div>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{product.name}</h1>
            <p className="text-slate-500 mb-8">Digital Twin of physical asset registered on Polygon.</p>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Manufacturer</div>
                <div className="font-bold text-slate-900">{product.manufacturer}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Minted On</div>
                <div className="font-bold text-slate-900">{new Date(product.mintedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Provenance */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-bold text-slate-900">Provenance History</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                <ExternalLink className="h-4 w-4" />
                View on PolygonScan
              </div>
            </div>
            
            <div className="relative space-y-12 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {product.history.map((event, i) => (
                <div key={i} className="relative pl-16">
                  <div className="absolute left-4 top-1.5 h-4 w-4 rounded-full bg-white border-4 border-indigo-500 z-10"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{event.step}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{event.time}</div>
                      <div className="text-xs text-slate-400">by {event.actor}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold">Ownership</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2">Current Owner</div>
                <div className="font-mono text-xs break-all bg-white/5 p-4 rounded-2xl border border-white/10">
                  {product.owner}
                </div>
              </div>
              
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                Ownership is verified using ZK-SNARKs to ensure privacy while maintaining a complete audit trail.
              </div>
              
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
                Transfer Ownership
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">GS1 Identifiers</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-xs text-slate-500">GTIN</span>
                <span className="font-mono text-xs font-bold">{product.gtin}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-xs text-slate-500">Serial</span>
                <span className="font-mono text-xs font-bold">{product.serial}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-slate-500">Standard</span>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">EPCIS v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
