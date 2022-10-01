import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Resp } from "src/models/resp";

// for development
const isThroughGateway = true;

const BASE_API = "/open/api";
const TOKEN = "token";
let emptyTokenCallback;

export function onEmptyToken(callback) {
  emptyTokenCallback = callback;
}

export function buildApiPath(
  subPath: string,
  service = environment.fileServicePath
): string {
  subPath = subPath.startsWith("/", 0) ? subPath : "/" + subPath;
  return (isThroughGateway ? service : "") + BASE_API + subPath;
}

export function buildOptions() {
  let token = getToken();
  if (!token) {
    return;
  }
  return {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: token,
    }),
    withCredentials: true,
  };
}

export function setToken(token: string) {
  if (token === null) localStorage.removeItem(TOKEN);
  else {
    localStorage.setItem(TOKEN, token);
  }
}

export function getToken() {
  let tkn = localStorage.getItem(TOKEN);
  if (!tkn && emptyTokenCallback) {
    console.log("No token found, invoking registered onEmptyToken callback");
    emptyTokenCallback();
  }
  return tkn;
}

@Injectable({
  providedIn: 'root'
})
export class HClient {

  constructor(private httpClient: HttpClient) { }

  /** Do POST request */
  post<T>(serviceBase: string, url: string, payload: any): Observable<Resp<T>> {
    return this.httpClient.post<Resp<T>>(
      buildApiPath(url, serviceBase), payload,
      buildOptions()
    );
  }

  /** Do GET request */
  get<T>(serviceBase: string, url: string): Observable<Resp<T>> {
    return this.httpClient.get<Resp<T>>(
      buildApiPath(url, serviceBase),
      buildOptions()
    );
  }

}
