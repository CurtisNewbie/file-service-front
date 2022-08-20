import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { PagingController } from "src/models/paging";
import { ListGalleryImagesResp } from "src/models/gallery";
import { buildApiPath, buildOptions, getToken } from "../util/api-util";
import { environment } from "src/environments/environment";
import { Resp } from "src/models/resp";
import { NavigationService, NavType } from "../navigation.service";
import { forkJoin, Observable } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-gallery-image",
  templateUrl: "./gallery-image.component.html",
  styleUrls: ["./gallery-image.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class GalleryImageComponent implements OnInit {
  @ViewChild("paginator", { static: true })
  paginator: MatPaginator;

  pagingController: PagingController = new PagingController();

  galleryNo: string = null;
  title = "fantahsea";
  images: { src: any; thumbnail: any }[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private navigation: NavigationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      let galleryNo = params.get("galleryNo");
      if (galleryNo) this.galleryNo = galleryNo;

      console.log("GalleryNo", this.galleryNo);

      this.fetchImages();
    });
  }

  fetchImages(): void {
    if (!this.galleryNo) this.navigation.navigateTo(NavType.GALLERY);

    this.http
      .post<Resp<ListGalleryImagesResp>>(
        buildApiPath("/gallery/images", environment.fantahseaPath),
        { galleryNo: this.galleryNo },
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.pagingController.updatePages(resp.data.pagingVo.total);

          this.images = [];
          if (resp.data.imageNos) {
            let imgs = resp.data.imageNos;
            this.images = [];
            for (let i = 0; i < imgs.length; i++) {
              let imageObs = this._downloadImage(imgs[i], false);
              let thumbnailObs = this._downloadImage(imgs[i], true);
              forkJoin([imageObs, thumbnailObs]).subscribe((results) => {
                this.images.push({
                  src: this.sanitizer.bypassSecurityTrustUrl(
                    URL.createObjectURL(results[0])
                  ),
                  thumbnail: this.sanitizer.bypassSecurityTrustUrl(
                    URL.createObjectURL(results[1])
                  ),
                });
              });
            }
          }
        },
      });
  }

  _downloadImage(
    imageNo: string,
    isThumbnail: boolean = false
  ): Observable<Blob> {
    let token = getToken();
    if (!token) {
      return null;
    }

    let options: {
      headers?: HttpHeaders;
      observe?: "body";
      reportProgress?: boolean;
      responseType: "blob";
      withCredentials?: boolean;
    } = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: token,
      }),
      responseType: "blob",
      withCredentials: true,
    };

    return this.http.get(
      buildApiPath(
        `/gallery/image/download?imageNo=${imageNo}&thumbnail=${isThumbnail}`,
        environment.fantahseaPath
      ),
      options
    );
  }

  handle(e: PageEvent): void {
    this.pagingController.handle(e);
    this.fetchImages();
  }
}
