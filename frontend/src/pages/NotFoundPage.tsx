import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <span className="kicker">Error 404</span>
      <h1 className="d d-xl">
        Off the <span className="outline">ledger.</span>
      </h1>
      <p className="muted">That page isn't registered anywhere in the chain.</p>
      <Link to="/" className="btn">
        <ArrowLeft size={18} /> Back home
      </Link>
    </div>
  );
}
