export const msalConfig = {
  auth: {
    clientId: "664122fa-6d08-4f38-bd70-37730f1da92a",
    authority: "https://login.microsoftonline.com/fbab81fb-f104-4a87-be4c-3ac3ad7966a7",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "https://org.crm.dynamics.com/user_impersonation"],
};