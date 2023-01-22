import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Resp } from "src/models/resp";

const BASE_API = "/open/api";
const TOKEN = "token";
let emptyTokenCallback;

/** callback for empty token, token is stored in internalStorage */
export function onEmptyToken(callback) {
  emptyTokenCallback = callback;
}

/** build api bath */
export function buildApiPath(
  relPath: string,
  serviceBashPath: string
): string {
  relPath = relPath.startsWith("/", 0) ? relPath : "/" + relPath;
  return serviceBashPath + BASE_API + relPath;
}

/** build options for http requests */
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

/** save token to internalStorage */
export function setToken(token: string) {
  if (token === null) localStorage.removeItem(TOKEN);
  else {
    localStorage.setItem(TOKEN, token);
  }
}

/** get token from internalStorage */
export function getToken() {
  let tkn = localStorage.getItem(TOKEN);
  if (!tkn && emptyTokenCallback) {
    console.log("No token found, invoking registered onEmptyToken callback");
    emptyTokenCallback();
  }
  return tkn;
}

/**
 * Wrapper of HttpClient
 */
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
