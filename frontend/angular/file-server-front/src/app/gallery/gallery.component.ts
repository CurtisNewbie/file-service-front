import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { animateElementExpanding, getExpanded, isIdEqual } from "src/animate/animate-util";
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

  idEquals = isIdEqual;
  getExpandedEle = (row) => getExpanded(row, this.expandedElement);

  constructor(
    private http: HClient,
    private userService: UserService,
    private notification: NotificationService,
    private navigation: NavigationService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.userService.roleObservable.subscribe((role) => (this.role = role));
  }

  fetchGalleries() {
    this.http
      .post<ListGalleriesResp>(
        environment.fantahseaPath, "/gallery/list",
        { pagingVo: this.pagingController.paging },
      )
      .subscribe({
        next: (resp) => {
          this.pagingController.onTotalChanged(resp.data.pagingVo);
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
        environment.fantahseaPath, "/gallery/new",
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

  // todo (impl this later)
  shareGallery(g: Gallery) { }

  deleteGallery(galleryNo: string, galleryName: string) {
    if (!galleryNo) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          title: 'Delete Gallery',
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

  onPagingControllerReady(pc) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchGalleries();
    this.fetchGalleries();
  }

  updateGallery(galleryNo: string, name: string) {
    if (!galleryNo || !name) return;

    this.http.post(environment.fantahseaPath, "/gallery/update", {
      galleryNo: galleryNo,
      name: name
    }).subscribe({
      complete: () => {
        this.expandedElement = null;
        this.fetchGalleries();
      }
    });
  }
}
