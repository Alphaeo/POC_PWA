import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

const DATAVERSE_URL = import.meta.env.VITE_DATAVERSE_URL;

const getToken = async () => {
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) throw new Error("Non connecté");

  const response = await msalInstance.acquireTokenSilent({
    scopes: [`${DATAVERSE_URL}/user_impersonation`],
    account: accounts[0],
  });
  return response.accessToken;
};

const headers = async () => ({
  Authorization: `Bearer ${await getToken()}`,
  "Content-Type": "application/json",
  "OData-MaxVersion": "4.0",
  "OData-Version": "4.0",
  Accept: "application/json",
});

export const getNotesFrais = async () => {
  const response = await fetch(
    `${DATAVERSE_URL}/api/data/v9.2/cr312_expensereports`,
    { headers: await headers() }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("Dataverse error:", err);
    throw new Error(`Erreur API: ${response.status}`);
  }

  const data = await response.json();
  return data.value ?? [];
};

export const createNoteFrais = async (note: Record<string, string | number>) => {
  const response = await fetch(
    `${DATAVERSE_URL}/api/data/v9.2/cr312_expensereports`,
    {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(note),
    }
  );
  return response;
};