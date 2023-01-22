import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { PagingController } from "src/models/paging";
import { ListGalleryImagesResp } from "src/models/gallery";
import { buildApiPath, buildOptions } from "../util/api-util";
import { environment } from "src/environments/environment";
import { Resp } from "src/models/resp";
import { NavigationService } from "../navigation.service";
import { IAlbum, Lightbox, LightboxConfig } from "ngx-lightbox";
import { NavType } from "../routes";

@Component({
  selector: "app-gallery-image",
  templateUrl: "./gallery-image.component.html",
  styleUrls: ["./gallery-image.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class GalleryImageComponent implements OnInit {
  pagingController: PagingController;
  galleryNo: string = null;
  title = "fantahsea";
  images: IAlbum[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private navigation: NavigationService,
    private _lightbox: Lightbox,
    private _lbConfig: LightboxConfig
  ) {
    _lbConfig.containerElementResolver = (doc: Document) =>
      doc.getElementById("lightboxdiv");
    _lbConfig.wrapAround = false;
    _lbConfig.disableScrolling = false;
    _lbConfig.showZoom = false;
    _lbConfig.resizeDuration = 0.2;
    _lbConfig.fadeDuration = 0.2;
    _lbConfig.showRotate = false;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      let galleryNo = params.get("galleryNo");
      if (galleryNo) this.galleryNo = galleryNo;
    });
  }

  fetchImages(): void {
    if (!this.galleryNo) this.navigation.navigateTo(NavType.GALLERY);

    this.http
      .post<Resp<ListGalleryImagesResp>>(
        buildApiPath("/gallery/images", environment.fantahseaPath),
        { galleryNo: this.galleryNo, pagingVo: this.pagingController.paging },
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.pagingController.onTotalChanged(resp.data.pagingVo);

          this.images = [];
          if (resp.data.images) {
            let imgs = resp.data.images;
            this.images = [];
            for (let i = 0; i < imgs.length; i++) {
              let src = buildApiPath(
                "/file/token/download?token=" + imgs[i].fileTempToken,
                environment.fileServicePath
              );
              let thumb = buildApiPath(
                "/gallery/image/download?token=" + imgs[i].thumbnailToken,
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

  onPagingControllerReady(pc: any) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchImages();
    this.pagingController.setPageLimit(40);
    this.pagingController.PAGE_LIMIT_OPTIONS = [20, 40, 60, 100, 500];

    this.fetchImages();
  }
}
