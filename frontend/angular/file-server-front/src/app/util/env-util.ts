import { environment } from "src/environments/environment";

export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function isServiceEnabled(service: string): boolean {
  return environment.services.find((v) => v.base === service) != null;
}

export function doOnServiceEnabled(service: string, callback) {
  if (isServiceEnabled(service)) {
    callback()
  }
}