import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { getNotesFrais } from "./dataverseService";
import NewNoteFrais from "./NewNoteFrais";

interface NoteFrais {
  cr312_expensereportid: string;
  cr312_title: string;
  cr312_totalamount: number;
  cr312_status: string;
  createdon: string;
}

const STATUS_LABELS: Record<string, string> = {
  "727220000": "Brouillon",
  "727220001": "Soumis",
  "727220002": "Validé N1",
  "727220003": "Validé N2",
  "727220004": "Rejeté",
  "727220005": "Remboursé",
};

const STATUS_COLORS: Record<string, string> = {
  "727220000": "#888",
  "727220001": "#0078d4",
  "727220002": "#107c10",
  "727220003": "#107c10",
  "727220004": "#d83b01",
  "727220005": "#107c10",
};

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [notes, setNotes] = useState<NoteFrais[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchNotes = () => {
    setLoading(true);
    getNotesFrais()
      .then(setNotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotes();
  }, [isAuthenticated]);

  const handleLogin = () => instance.loginRedirect(loginRequest);
  const handleLogout = () => instance.logoutRedirect();

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Notes de frais</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>Connectez-vous avec votre compte Microsoft</p>
        <button onClick={handleLogin} style={{ padding: "12px 32px", backgroundColor: "#0078d4", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      {showForm && (
        <NewNoteFrais
          onSuccess={() => { setShowForm(false); fetchNotes(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Notes de frais</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>Bonjour, {accounts[0]?.name}</span>
          <button onClick={() => setShowForm(true)}
            style={{ padding: "8px 16px", background: "#0078d4", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>
            + Nouvelle note
          </button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", background: "white", fontSize: "14px" }}>
            Déconnexion
          </button>
        </div>
      </div>

      {loading && <p style={{ color: "#666" }}>Chargement...</p>}
      {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

      {!loading && !error && notes.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px", color: "#666", border: "1px dashed #ddd", borderRadius: "8px" }}>
          <p>Aucune note de frais pour le moment.</p>
        </div>
      )}

      {notes.map((note) => (
        <div key={note.cr312_expensereportid} style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "15px" }}>{note.cr312_title}</strong>
            <span style={{ fontSize: "16px", fontWeight: 500, color: "#0078d4" }}>{note.cr312_totalamount} €</span>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "13px" }}>
            <span style={{ color: STATUS_COLORS[note.cr312_status] ?? "#888" }}>
              {STATUS_LABELS[note.cr312_status] ?? note.cr312_status}
            </span>
            <span style={{ color: "#999" }}>{new Date(note.createdon).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;