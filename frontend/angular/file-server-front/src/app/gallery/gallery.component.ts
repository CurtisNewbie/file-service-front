import { HttpClient } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { animateElementExpanding } from "src/animate/animate-util";
import { environment } from "src/environments/environment";
import { Gallery, ListGalleriesResp } from "src/models/gallery";
import { PagingController } from "src/models/paging";
import { Resp } from "src/models/resp";
import { NavigationService, NavType } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { UserService } from "../user.service";
import { buildApiPath, buildOptions } from "../util/api-util";
import { isMobile } from "../util/env-util";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrls: ["./gallery.component.css"],
  animations: [animateElementExpanding()],
})
export class GalleryComponent implements OnInit {
  readonly DESKTOP_COLUMNS = [
    "galleryNo",
    "name",
    "userNo",
    "createTime",
    "createBy",
  ];
  readonly MOBILE_COLUMNS = ["galleryNo", "name", "userNo"];

  @ViewChild("paginator", { static: true })
  paginator: MatPaginator;

  pagingController: PagingController;
  galleries: Gallery[] = [];
  isMobile: boolean = isMobile();
  expandedElement: Gallery = null;
  role: string = "";
  newGalleryName: string = "";
  showCreateGalleryDiv: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private notification: NotificationService,
    private navigation: NavigationService
  ) {
    this.pagingController = new PagingController();
    this.pagingController.onPageChanged = () => this.fetchGalleries();
  }

  ngOnInit() {
    this.userService.roleObservable.subscribe((role) => (this.role = role));
    this.fetchGalleries();
  }

  fetchGalleries() {
    this.httpClient
      .post<Resp<ListGalleriesResp>>(
        buildApiPath("/gallery/list", environment.fantahseaPath),
        { pagingVo: this.pagingController.paging },
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.pagingController.updatePages(resp.data.pagingVo.total);
          this.galleries = resp.data.galleries;
          this.expandedElement = null;
        },
      });
  }

  createGallery() {
    if (!this.newGalleryName) {
      this.notification.toast("Please enter new gallery's name");
      return;
    }

    this.httpClient
      .post<Resp<any>>(
        buildApiPath("/gallery/new", environment.fantahseaPath),
        {
          name: this.newGalleryName,
        },
        buildOptions()
      )
      .subscribe({
        complete: () => this.fetchGalleries(),
      });
  }

  /**
   * Two non-null Gallery are considered equals, when the id are equals, if any one of them is null, they are not equals
   */
  idEquals(fl: Gallery, fr: Gallery): boolean {
    if (fl == null || fr == null) return false;

    return fl.id === fr.id;
  }

  /**
   * Look at the row, determine whether we should expand this row (return this row)
   *
   * @param row null value if we shouldn't expand this element, else a copy of this row
   * @returns expandedElement
   */
  determineExpandedElement(row: Gallery): Gallery {
    return this.idEquals(this.expandedElement, row) ? null : this._copy(row);
  }

  // todo (impl this later)
  shareGallery(g: Gallery) { }

  deleteGallery(galleryNo: string) {
    if (!galleryNo) return;
    this.httpClient
      .post<Resp<any>>(
        buildApiPath("/gallery/delete", environment.fantahseaPath),
        {
          galleryNo: galleryNo,
        },
        buildOptions()
      )
      .subscribe({
        complete: () => this.fetchGalleries(),
      });
  }

  browse(galleryNo: string) {
    this.navigation.navigateTo(NavType.GALLERY_IMAGE, [
      { galleryNo: galleryNo },
    ]);
  }

  private _copy(f: Gallery): Gallery {
    if (!f) return null;
    let copy = { ...f };
    return copy;
  }
}
