import { fantahseaOpt, fileServiceOpt } from "src/models/nav";

export const environment = {
  production: true,
  fantahseaPath: "fantahsea",
  fileServicePath: "file-service",
  authServicePath: "auth-service",
  services: [fileServiceOpt, fantahseaOpt],
  loginRedirect: true,
  goauthPath: "goauth",

  // if fantahsea is down
  // services: [fileServiceOpt],
};
