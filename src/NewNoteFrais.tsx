import { useState } from "react";
import { createNoteFrais } from "./dataverseService";
import { analyzeReceipt } from "./ocrService";
import type { OcrResult } from "./ocrService";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewNoteFrais({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    cr312_title: "",
    cr312_employeename: "",
    cr312_employeeemail: "",
    cr312_totalamount: 0,
    cr312_currency: "EUR",
    cr312_status: 727220000,
  });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setError(null);
    try {
      const result = await analyzeReceipt(file);
      setOcrResult(result);
      setForm((prev) => ({
        ...prev,
        cr312_title: result.merchantName ?? prev.cr312_title,
        cr312_totalamount: result.total ?? prev.cr312_totalamount,
      }));
    } catch (e: any) {
      setError(`OCR échoué: ${e.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createNoteFrais({
        cr312_title: form.cr312_title,
        cr312_employeename: form.cr312_employeename,
        cr312_employeeemail: form.cr312_employeeemail,
        cr312_totalamount: Number(form.cr312_totalamount),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.text();
        setError(`Erreur: ${err}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: string, type = "text") => (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", color: "#666", marginBottom: "4px" }}>{label}</label>
      <input
        type={type}
        name={name}
        value={(form as any)[name]}
        onChange={handleChange}
        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "480px", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontSize: "18px", margin: "0 0 24px" }}>Nouvelle note de frais</h2>

        {/* Bouton photo OCR */}
        <div style={{ marginBottom: "20px", padding: "16px", border: "2px dashed #0078d4", borderRadius: "8px", textAlign: "center" }}>
          <label style={{ cursor: "pointer", color: "#0078d4", fontSize: "14px", fontWeight: 500 }}>
            {ocrLoading ? "Analyse en cours..." : "📷 Prendre une photo du justificatif"}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
          </label>
          {ocrResult && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#107c10" }}>
              ✓ {ocrResult.merchantName} — {ocrResult.total}€ — {ocrResult.date}
            </div>
          )}
        </div>

        {field("Titre", "cr312_title")}
        {field("Votre nom", "cr312_employeename")}
        {field("Votre email", "cr312_employeeemail")}
        {field("Montant (€)", "cr312_totalamount", "number")}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#666", marginBottom: "4px" }}>Devise</label>
          <select name="cr312_currency" value={form.cr312_currency} onChange={handleChange}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", background: "white" }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex: 1, padding: "10px", background: "#0078d4", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}