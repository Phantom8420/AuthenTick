import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Wallet } from "lucide-react";
import { apiGet } from "@/api/client";
import { useWallet } from "@/context/WalletContext";

interface MetadataResponse {
  product: {
    tokenId: string;
    name: string;
    gtin: string;
    serial: string;
    manufacturerId: string;
    status: string;
    currentOwner?: string;
  };
  events: Array<{
    bizStep: string;
    readPoint: string;
    eventTime: string;
    actor: string;
  }>;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<MetadataResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { account, connectWallet } = useWallet();

  useEffect(() => {
    if (!id) return;
    void apiGet<MetadataResponse>(`/api/metadata/${encodeURIComponent(id)}`)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Load failed"));
  }, [id]);

  if (err) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <p style={{ color: "var(--accent-red)", marginBottom: "1.5rem" }}>{err}</p>
        <Link to="/" className="btn btn-outline">
          Return Home
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <div style={{ height: "2.5rem", width: "2.5rem", border: "4px solid var(--border-color)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
        <div>
          <Link to="/" className="nav-link" style={{ display: "inline-flex", marginBottom: "1rem", fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 className="title" style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>{data.product.name}</h1>
          <p className="text-mono text-xs text-muted">{data.product.tokenId}</p>
        </div>
        
        <div>
          {!account ? (
            <button onClick={connectWallet} className="btn btn-outline" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
              <Wallet size={16} />
              Connect Wallet
            </button>
          ) : (
            <div className="badge badge-green text-mono hidden sm:inline-flex">
              Connected: {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>Identifiers</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <span className="text-secondary">GTIN</span>
              <span className="text-mono font-medium">{data.product.gtin}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <span className="text-secondary">Serial Number</span>
              <span className="text-mono font-medium">{data.product.serial}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <span className="text-secondary">Status</span>
              <span className="badge">{data.product.status}</span>
            </div>
            {data.product.currentOwner && (
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                <span className="text-secondary">Current Owner</span>
                <span className="text-mono text-xs text-accent bg-opacity-10 px-2 py-1 rounded">{data.product.currentOwner}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>Provenance Timeline</h2>
          
          {data.events.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">No events recorded yet.</p>
          ) : (
            <ul className="timeline">
              {data.events.map((e, index) => (
                <li key={`${e.eventTime}-${e.bizStep}`} className={index === data.events.length - 1 ? 'active' : ''}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{e.bizStep.split(':').pop()?.toUpperCase() || e.bizStep}</div>
                  <div className="text-xs text-secondary" style={{ marginBottom: "0.25rem" }}>Loc: <span className="text-mono">{e.readPoint}</span></div>
                  <div className="text-xs text-muted">{new Date(e.eventTime).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}