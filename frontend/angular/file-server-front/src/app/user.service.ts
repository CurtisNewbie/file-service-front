import { Injectable, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { FindValueSubscriber } from "rxjs/internal/operators/find";
import { FetchUserInfoParam } from "src/models/request-model";
import { Resp } from "src/models/resp";
import {
  FetchUserInfoResp as FetchUserInfoResp,
  UserInfo,
} from "src/models/user-info";
import { HttpClientService } from "./http-client-service.service";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private userInfo: UserInfo = null;
  private roleSubject = new Subject<string>();
  private isLoggedInSubject = new Subject<boolean>();

  roleObservable: Observable<string> = this.roleSubject.asObservable();
  isLoggedInObservable: Observable<boolean> =
    this.isLoggedInSubject.asObservable();

  constructor(
    private httpClient: HttpClientService,
    private router: Router,
    private notifi: NotificationService
  ) {}

  /**
   * Attempt to signin
   * @param username
   * @param password
   */
  public login(username: string, password: string): Observable<Resp<any>> {
    return this.httpClient.login(username, password);
  }

  /**
   * Logout current user
   */
  public logout(): Observable<any> {
    this.setLogout();
    return this.httpClient.logout();
  }

  /**
   * Set user being logged out
   */
  public setLogout(): void {
    this.userInfo = null;
    this.notifyLoginStatus(false);
    this.router.navigate(["/login-page"]);
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
    return this.httpClient.addUser({ username, password, userRole });
  }

  /**
   * Fetch user info
   */
  public fetchUserInfo(): void {
    this.httpClient.fetchUserInfo().subscribe({
      next: (resp) => {
        if (resp.data != null) {
          this.userInfo = resp.data;
          this.notifyRole(this.userInfo.role);
          this.notifyLoginStatus(true);
        } else {
          this.notifi.toast("Please login first");
          this.router.navigate(["/login-page"]);
          this.notifyLoginStatus(false);
        }
      },
    });
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
   * Get user info that is previously fetched
   */
  public getUserInfo(): UserInfo {
    return this.userInfo;
  }

  /**
   * Check if the service has the user info already
   */
  public hasUserInfo(): boolean {
    return this.userInfo != null;
  }

  /**
   * Fetch list of user infos (only admin is allowed)
   */
  public fetchUserList(
    param: FetchUserInfoParam
  ): Observable<Resp<FetchUserInfoResp>> {
    return this.httpClient.fetchUserList(param);
  }

  /**
   * Disable user by id (only admin is allowed)
   * @param id
   */
  public disableUserById(id: number): Observable<Resp<any>> {
    return this.httpClient.disableUserByid(id);
  }

  /**
   * Enable user by id (only admin is allowed)
   * @param id
   */
  public enableUserById(id: number): Observable<Resp<any>> {
    return this.httpClient.enableUserById(id);
  }
}
