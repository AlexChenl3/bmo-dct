import { useCallback, useState } from "react";
import UploadPanel from "./components/UploadPanel";
import HoldingsTable from "./components/HoldingsTable";
import FundPriceChart from "./components/FundPriceChart";
import TopHoldingsChart from "./components/TopHoldingsChart";

/**
 * Upload a weights CSV to the backend and return the reconstruction payload.
 */
async function analyzeFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.detail) detail = body.detail;
    } catch (err) {
      // Response was not JSON; keep the status-based message.
    }
    throw new Error(detail);
  }

  return res.json();
}

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleUpload = useCallback(async (file) => {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeFile(file);
      setAnalysis(result);
      setSourceLabel(file.name);
    } catch (err) {
      setAnalysis(null);
      setSourceLabel("");
      setError(`Could not analyze ${file.name}: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>BMO ETF Web Application</h1>
      </header>

      <UploadPanel onUpload={handleUpload} busy={busy} />

      {busy && <p className="status">Loading&hellip;</p>}

      {!busy && analysis && sourceLabel && (
        <p className="status">
          Showing: <strong>{sourceLabel}</strong>
        </p>
      )}

      {analysis && analysis.warnings && analysis.warnings.length > 0 && (
        <ul className="warnings">
          {analysis.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}

      {analysis && (
        <>
          <HoldingsTable holdings={analysis.holdings} />
          <FundPriceChart series={analysis.fundSeries} />
          <TopHoldingsChart topHoldings={analysis.topHoldings} />
        </>
      )}
    </div>
  );
}