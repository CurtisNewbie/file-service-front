import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NavigationService, NavType } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { UserService } from "../user.service";
import { setToken } from "../util/api-util";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  usernameInput: string = "";
  passwordInput: string = "";

  constructor(
    private userService: UserService,
    private nav: NavigationService,
    private notifi: NotificationService
  ) {}

  ngOnInit() {
    this.userService.fetchUserInfo();
  }

  /**
   * login request
   */
  public login(): void {
    if (!this.usernameInput || !this.passwordInput) {
      this.notifi.toast("Please enter username and password");
      return;
    }
    this.userService.login(this.usernameInput, this.passwordInput).subscribe({
      next: (resp) => {
        setToken(resp.data);
        this.routeToHomePage();
        this.userService.fetchUserInfo();
      },
      complete: () => {
        this.passwordInput = "";
      },
    });
  }

  private routeToHomePage(): void {
    this.nav.navigateTo(NavType.HOME_PAGE);
  }

  passwordInputKeyPressed(event: any): void {
    if (event.key === "Enter") {
      this.login();
    }
  }

  goToRegisterPage(): void {
    this.nav.navigateTo(NavType.REGISTER_PAGE);
  }
}
