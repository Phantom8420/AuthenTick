import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, ShieldCheck } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 280, height: 280 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        navigate(`/product/${encodeURIComponent(decodedText)}`);
      },
      (err) => {
        // Ignored for continuous scanning
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [navigate]);

  return (
    <AnimatedSection className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-electric-blue/10 border border-electric-blue/30 mb-6 relative overflow-hidden"
        >
          {/* Scanning line animation */}
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[2px] bg-electric-blue shadow-[0_0_8px_2px_rgba(37,99,235,0.8)]"
          />
          <QrCode className="h-10 w-10 text-electric-blue" />
        </motion.div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Verify Authenticity
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
          Position the product's QR code within the frame below to cryptographically verify its origin and scan its supply chain history.
        </p>
      </div>

      <Card hoverEffect={false} className="w-full max-w-lg p-2 bg-slate-950 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* html5-qrcode injects styles, so we wrap it to constrain it */}
        <div className="rounded-[20px] overflow-hidden bg-black border-2 border-slate-800 relative">
          <div id="qr-reader" className="w-full h-full [&_video]:rounded-[20px] [&_video]:object-cover" />
          
          {/* Overlay corners for scanner aesthetic */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-electric-blue rounded-tl-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-electric-blue rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-electric-blue rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-electric-blue rounded-br-xl pointer-events-none" />
        </div>
      </Card>

      {error && (
        <AnimatedSection delay={0.3} className="mt-6 text-center">
          <p className="inline-flex items-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm">
            {error}
          </p>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.4} className="mt-12 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
        <ShieldCheck className="w-5 h-5" /> Secured by AuthenTick Network
      </AnimatedSection>
    </AnimatedSection>
  );
}