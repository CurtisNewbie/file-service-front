import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Resp } from "src/models/resp";
import { UserInfo } from "src/models/user-info";
import { NavigationService } from "./navigation.service";
import { NotificationService } from "./notification.service";
import { NavType } from "./routes";
import {
  getToken,
  setToken,
  onEmptyToken,
  HClient,
} from "./util/api-util";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private roleSubject = new Subject<string>();
  private isLoggedInSubject = new Subject<boolean>();
  private userInfoSubject = new Subject<UserInfo>();
  private resources: Set<string> = null;

  // refreshed every 5min
  private tokenRefresher: Subscription = timer(60_000, 360_000).subscribe(
    () => {
      let t = getToken();
      if (t != null) {
        this.exchangeToken(t).subscribe({
          next: (resp) => {
            setToken(resp.data);
          },
        });
      }
    }
  );

  userInfoObservable: Observable<UserInfo> =
    this.userInfoSubject.asObservable();
  roleObservable: Observable<string> = this.roleSubject.asObservable();
  isLoggedInObservable: Observable<boolean> =
    this.isLoggedInSubject.asObservable();

  constructor(
    private http: HClient,
    private nav: NavigationService,
    private notifi: NotificationService
  ) {
    onEmptyToken(() => this.logout());
  }

  public fetchUserResources(): Observable<any> {
    let sub = new Subject<any>();
    this.http.get<any>(environment.goauthPath, "/resource/brief/user").subscribe({
      next: (res) => {
        this.resources = new Set();
        if (res.data) {
          for (let r of res.data) {
            this.resources.add(r.code);
          }
        }
        sub.complete();
      }
    });
    return sub.asObservable();
  }

  hasResource(code): boolean {
    if (this.resources == null) return false;
    return this.resources.has(code);
  }

  /**
   * Attempt to sign-in
   * @param username
   * @param password
   */
  public login(username: string, password: string): Observable<Resp<any>> {
    return this.http.post<Resp<any>>(
      environment.authServicePath, "/user/login",
      {
        username: username,
        password: password,
        appName: "file-service",
      }
    );
  }

  /**
   * Logout current user
   */
  public logout(): void {
    setToken(null);
    this.notifyLoginStatus(false);
    if (environment.loginRedirect) {
      this.nav.navigateTo(NavType.LOGIN_PAGE);
    }
  }

  /**
   * Add user, only admin is allowed to add user
   * @param username
   * @param password
   * @returns
   */
  public addUser(
    username: string,
    password: string,
    userRole: string
  ): Observable<Resp<any>> {
    return this.http.post<any>(
      environment.authServicePath, "/user/register",
      { username, password, userRole },
    );
  }

  /**
   * Register user
   * @param username
   * @param password
   * @returns
   */
  public register(username: string, password: string): Observable<Resp<any>> {
    return this.http.post<any>(
      environment.authServicePath, "/user/register/request",
      { username, password },
    );
  }

  /**
   * Fetch user info
   */
  public fetchUserInfo(callback = null): void {
    this.http
      .get<UserInfo>(
        environment.authServicePath, "/user/info",
      )
      .subscribe({
        next: (resp) => {
          if (resp.data != null) {
            this.notifyRole(resp.data.role);
            this.notifyLoginStatus(true);
            this.notifyUserInfo(resp.data);
            if (callback != null) callback();
          } else {
            this.notifi.toast("Please login first");
            setToken(null);
            this.notifyLoginStatus(false);
            this.nav.navigateTo(NavType.LOGIN_PAGE);
          }
        },
      });
  }

  private notifyUserInfo(userInfo: UserInfo): void {
    this.userInfoSubject.next(userInfo);
  }

  /** Notify the role of the user via observable */
  private notifyRole(role: string): void {
    this.roleSubject.next(role);
  }

  /** Notify the login status of the user via observable */
  private notifyLoginStatus(isLoggedIn: boolean): void {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  /**
   * Fetch user details
   */
  public fetchUserDetails(): Observable<
    Resp<{
      id;
      username;
      role;
      registerDate;
    }>
  > {
    return this.http.get<any>(environment.authServicePath, "/user/detail");
  }

  /**
   * Exchange Token
   */
  private exchangeToken(token: string): Observable<Resp<string>> {
    return this.http.post<any>(
      environment.authServicePath, "/token/exchange",
      { token: token },
    );
  }
}
