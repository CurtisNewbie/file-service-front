import { Component } from "@angular/core";
import { NLink, selectLinks } from "src/models/link";
import { UserInfo } from "src/models/user-info";
import { NavigationService } from "./navigation.service";
import { UserService } from "./user.service";
import { getToken } from "./util/api-util";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  userInfo: UserInfo = null;
  activeRoute: string = "";
  links: NLink[] = [];
  base: string = "file-service";

  onNavClicked = (link: NLink): void => {
    this.activeRoute = link.route;
  };

  isActive = (link: NLink): boolean => {
    return this.activeRoute === link.route;
  };

  constructor(
    private userService: UserService,
    private navigation: NavigationService
  ) { }

  ngOnInit(): void {
    if (getToken()) {
      this.userService.fetchUserInfo();
    }
    this.userService.userInfoObservable.subscribe({
      next: (user) => {
        this.userInfo = user;
        this.userService.fetchUserResources().subscribe({
          complete: () => {
            this.selectLinks();
          }
        });;

      },
    });
    this.userService.isLoggedInObservable.subscribe({
      next: (isLoggedIn) => {
        if (!isLoggedIn) {
          this.userInfo = null;
          this.links = [];
        }
      },
    });
  }

  onBaseChange(base: string): void {
    this.base = base;
    this.selectLinks();
    localStorage.setItem("nav-base", base);
    this.navigation.navigateToUrl(this.links[0].route);
  }

  selectLinks(): void {
    this.links = selectLinks(
      this.base,
      (c) => this.userService.hasResource(c)
    );
    console.log(this.links);
  }

}
