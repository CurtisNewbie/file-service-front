import { fantahseaOpt, fileServiceOpt } from "src/models/nav";

export const environment = {
  production: true,
  file_server_path: window.location.origin,
  services: [fileServiceOpt, fantahseaOpt],

  // if fantahsea is down
  // services: [fileServiceOpt],
};
