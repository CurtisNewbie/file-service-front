import { Component, OnInit } from "@angular/core";
import { NavigationService } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { NavType } from "../routes";
import { UserService } from "../user.service";
import { setToken, getToken } from "../util/api-util";

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
  ) { }

  ngOnInit() {
    if (getToken()) {
      this.userService.fetchUserInfo(() =>
        this.nav.navigateTo(NavType.HOME_PAGE)
      );
    }
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
}
