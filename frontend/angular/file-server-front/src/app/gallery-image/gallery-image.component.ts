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
import { IAlbum, Lightbox, LightboxConfig } from "ngx-lightbox";

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
  images: IAlbum[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private navigation: NavigationService,
    private _lightbox: Lightbox,
    private _lighboxConfig: LightboxConfig
  ) {
    _lighboxConfig.containerElementResolver = (doc: Document) =>
      doc.getElementById("lightboxdiv");
    _lighboxConfig.wrapAround = true;
    _lighboxConfig.disableScrolling = false;
    _lighboxConfig.showZoom = true;
    _lighboxConfig.resizeDuration = 0.2;
    _lighboxConfig.fadeDuration = 0.3;
  }

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
              let src = buildApiPath(
                `/gallery/image/download?token=${imgs[i]}&thumbnail=${false}`,
                environment.fantahseaPath
              );
              let thumb = buildApiPath(
                `/gallery/image/download?token=${imgs[i]}&thumbnail=${true}`,
                environment.fantahseaPath
              );
              this.images.push({
                src: src,
                thumb: thumb,
                downloadUrl: src,
              });
            }
          }
        },
      });
  }

  handle(e: PageEvent): void {
    this.pagingController.handle(e);
    this.fetchImages();
  }

  open(index: number): void {
    this._lightbox.open(this.images, index, {
      wrapAround: true,
      showImageNumberLabel: true,
    });
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
}
