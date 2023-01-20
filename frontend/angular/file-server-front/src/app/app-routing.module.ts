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
import { ManageExtensionComponent } from "./manage-extension/manage-extension.component";
import { MediaStreamerComponent } from "./media-streamer/media-streamer.component";
import { PdfViewerComponent } from "./pdf-viewer/pdf-viewer.component";

const routes: Routes = [
  {
    path: "home-page",
    component: HomePageComponent,
  },
  {
    path: "login-page",
    component: LoginComponent,
  },
  {
    path: "file-task",
    component: FileTaskComponent,
  },
  {
    path: "manage-fsgroup",
    component: FsGroupComponent,
  },
  {
    path: "pdf-viewer",
    component: PdfViewerComponent,
  },
  {
    path: "image-viewer",
    component: ImageViewerComponent,
  },
  {
    path: "gallery",
    component: GalleryComponent,
  },
  {
    path: "gallery-image",
    component: GalleryImageComponent,
  },
  {
    path: "folders",
    component: FolderComponent,
  },
  {
    path: "media",
    component: MediaStreamerComponent,
  },
  { path: "**", redirectTo: "/login-page" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
