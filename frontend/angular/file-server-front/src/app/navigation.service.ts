import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  constructor(private router: Router) { }

  /** Navigate to using Router*/
  public navigateTo(nt: NavType, extra?: any[]): void {
    this.navigateToUrl(nt, extra);
  }

  /** Navigate to using Router*/
  public navigateToUrl(url: string, extra?: any[]): void {
    let arr: any[] = [url];
    if (extra != null) arr = arr.concat(extra);
    this.router.navigate(arr);
  }
}

/** Navigation Type (Where we are navigating to) */
export enum NavType {
  HOME_PAGE = "home-page",
  LOGIN_PAGE = "login-page",
  MANAGE_EXT = "manage-extension",
  FOLDERS = "folders",
  PDF_VIEWER = "pdf-viewer",
  IMAGE_VIEWER = "image-viewer",
  GALLERY = "gallery",
  GALLERY_IMAGE = "gallery-image",
  MEDIA_STREAMER = "media",
}
