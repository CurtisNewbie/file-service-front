import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { animateElementExpanding } from "src/animate/animate-util";
import { environment } from "src/environments/environment";
import { Gallery, ListGalleriesResp } from "src/models/gallery";
import { PagingController } from "src/models/paging";
import { ConfirmDialogComponent } from "../dialog/confirm/confirm-dialog.component";
import { NavigationService, NavType } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { UserService } from "../user.service";
import { HClient } from "../util/api-util";
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
    private http: HClient,
    private userService: UserService,
    private notification: NotificationService,
    private navigation: NavigationService,
    private dialog: MatDialog,
  ) {
    this.pagingController = new PagingController();
    this.pagingController.onPageChanged = () => this.fetchGalleries();
  }

  ngOnInit() {
    this.userService.roleObservable.subscribe((role) => (this.role = role));
    this.fetchGalleries();
  }

  fetchGalleries() {
    this.http
      .post<ListGalleriesResp>(
        environment.fantahseaPath, "/gallery/list",
        { pagingVo: this.pagingController.paging },
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

    this.http
      .post<any>(
        "/gallery/new", environment.fantahseaPath,
        {
          name: this.newGalleryName,
        }
      )
      .subscribe({
        next: (resp) => {
          this.newGalleryName = null;
        },
        complete: () => {
          this.fetchGalleries();
          this.expandedElement = null;
          this.showCreateGalleryDiv = false;
        },
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

  deleteGallery(galleryNo: string, galleryName: string) {
    if (!galleryNo) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          msg: [`You sure you want to delete '${galleryName}'`],
          isNoBtnDisplayed: true,
        },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log(confirm);
      if (confirm) {
        this.http
          .post<any>(
            environment.fantahseaPath, "/gallery/delete",
            {
              galleryNo: galleryNo,
            },
          )
          .subscribe({
            complete: () => this.fetchGalleries(),
          });
      }
      this.expandedElement = null;
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
