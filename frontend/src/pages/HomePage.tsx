import { Link } from "react-router-dom";
import { Shield, QrCode, Factory, ChevronRight, CheckCircle2, Box } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <AnimatedSection className="w-full relative py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Abstract Glow in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-electric-blue/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-electric-blue text-sm font-semibold mb-8 tracking-wide shadow-lg shadow-electric-blue/20">
            <Shield className="h-4 w-4" /> Enterprise-Grade Verification
          </span>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
            Unbreakable Trust for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-teal-accent">Physical Products</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Verify authenticity and track complete lifecycle provenance instantly. Combines hybrid blockchain identity with GS1 EPCIS-compliant supply chain events.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/verify">
              <Button className="w-full sm:w-auto text-base px-8 py-4">
                <QrCode className="mr-2 h-5 w-5" /> Verify Asset
              </Button>
            </Link>
            <Link to="/manufacturer">
              <Button variant="secondary" className="w-full sm:w-auto text-base px-8 py-4">
                <Factory className="mr-2 h-5 w-5" /> Manufacturer Portal
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Feature Architecture Section */}
      <AnimatedSection delay={0.2} className="w-full max-w-6xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">The Stack Behind the Trust</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">AuthenTick leverages a state-of-the-art hybrid architecture that provides maximum security and operational scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="p-8">
            <div className="h-12 w-12 rounded-2xl bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center mb-6">
              <Box className="h-6 w-6 text-electric-blue" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Hardhat Contracts</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Immutable AuthenTickNFTs representing physical digital twins. Complete RoleManager and OwnershipRegistry mechanisms on-chain.
            </p>
          </Card>

          <Card hoverEffect className="p-8">
            <div className="h-12 w-12 rounded-2xl bg-teal-accent/10 border border-teal-accent/20 flex items-center justify-center mb-6">
              <Activity className="h-6 w-6 text-teal-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">EPCIS Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Express + MongoDB backend handles high-frequency GS1 EPCIS events (commissioning, shipping, receiving).
            </p>
          </Card>

          <Card hoverEffect className="p-8 flex flex-col">
            <div className="h-12 w-12 rounded-2xl bg-violet-accent/10 border border-violet-accent/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-6 w-6 text-violet-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Client Verifier</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              React + QR Scanner interfaces to instantly query Ethers.js and construct product provenance streams.
            </p>
            <Link to="/supply-chain" className="inline-flex items-center text-sm font-semibold text-violet-accent hover:text-violet-400 transition-colors">
              Explore Supply Chain <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
        </div>
      </AnimatedSection>
      
    </div>
  );
}

// Temporary inline component for Activity icon since it might not be imported correctly if I messed up
function Activity(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>
}