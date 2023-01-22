import { Component, DoCheck, OnDestroy, OnInit } from "@angular/core";
import { Output, EventEmitter } from "@angular/core";
import { environment } from "src/environments/environment";
import { BaseOpt } from "src/models/nav";
import { getLLang, LLang, onLangChange, setLLang, translate } from "src/models/translate";
import { UserInfo } from "src/models/user-info";
import { UserService } from "../user.service";
import { getToken } from "../util/api-util";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.css"],
})
export class NavComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  userInfo: UserInfo = null;
  baseOptions: BaseOpt[] = environment.services;
  base: string = "file-service";

  lang: LLang = getLLang();
  i18n = translate;
  onLangChangeSub = onLangChange.subscribe({
    next: (e) => {
      this.lang = e.lang;
    }
  });

  @Output() baseChangeEvent = new EventEmitter<string>();

  constructor(private userService: UserService) { }

  ngOnDestroy(): void {
    this.onLangChangeSub.unsubscribe();
  }

  emitBaseChangeEvent(event: string): void {
    this.base = event;
    this.baseChangeEvent.emit(this.base);
  }

  ngOnInit(): void {
    if (getToken()) {
      this.userService.fetchUserInfo();
    }
    this.userService.userInfoObservable.subscribe({
      next: (user) => {
        this.isAdmin = user.role === "admin";
        this.userInfo = user;
      },
    });
    this.userService.isLoggedInObservable.subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.isAdmin = false;
          this.userInfo = null;
        }
      },
    });
  }

  /** log out current user and navigate back to login page */
  logout(): void {
    this.userService.logout();
  }

  changeLang() {
    this.lang = this.lang == LLang.EN ? LLang.CN : LLang.EN;
    setLLang(this.lang);
  }
}
