import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FileTaskComponent } from "./file-task/file-task.component";
import { FolderComponent } from "./folder/folder.component";
import { FsGroupComponent } from "./fs-group/fs-group.component";
import { GalleryImageComponent } from "./gallery-image/gallery-image.component";
import { GalleryComponent } from "./gallery/gallery.component";
import { HomePageComponent } from "./home-page/home-page.component";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { LoginComponent } from "./login/login.component";
import { MediaStreamerComponent } from "./media-streamer/media-streamer.component";
import { PdfViewerComponent } from "./pdf-viewer/pdf-viewer.component";
import { NavType } from "./routes";

const routes: Routes = [
  {
    path: NavType.HOME_PAGE,
    component: HomePageComponent,
  },
  {
    path: NavType.LOGIN_PAGE,
    component: LoginComponent,
  },
  {
    path: NavType.FILE_TASK,
    component: FileTaskComponent,
  },
  {
    path: NavType.MANAGE_FSGROUP,
    component: FsGroupComponent,
  },
  {
    path: NavType.PDF_VIEWER,
    component: PdfViewerComponent,
  },
  {
    path: NavType.IMAGE_VIEWER,
    component: ImageViewerComponent,
  },
  {
    path: NavType.GALLERY,
    component: GalleryComponent,
  },
  {
    path: NavType.GALLERY_IMAGE,
    component: GalleryImageComponent,
  },
  {
    path: NavType.FOLDERS,
    component: FolderComponent,
  },
  {
    path: NavType.MEDIA_STREAMER,
    component: MediaStreamerComponent,
  },
  { path: "**", redirectTo: "/" + NavType.LOGIN_PAGE },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
