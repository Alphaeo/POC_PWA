import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Notes de frais</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>Connectez-vous avec votre compte Microsoft</p>
        <button
          onClick={handleLogin}
          style={{ padding: "12px 32px", backgroundColor: "#0078d4", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Notes de frais</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#666" }}>Bonjour, {accounts[0]?.name}</span>
          <button
            onClick={handleLogout}
            style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", background: "white" }}
          >
            Déconnexion
          </button>
        </div>
      </div>
      <p style={{ color: "#666" }}>Tableau de bord — en construction</p>
    </div>
  );
}

export default App;
