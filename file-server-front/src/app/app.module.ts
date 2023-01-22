import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomePageComponent } from "./home-page/home-page.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { LightboxModule } from "ngx-lightbox";
import {
  APP_BASE_HREF,
  HashLocationStrategy,
  LocationStrategy,
} from "@angular/common";
import { LoginComponent } from "./login/login.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { NavComponent } from "./nav/nav.component";
import { RespInterceptor } from "./interceptors/resp-interceptor";
import { ErrorInterceptor } from "./interceptors/error-interceptor";
import { ManageExtensionComponent } from "./manage-extension/manage-extension.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "./dialog/confirm/confirm-dialog.component";
import { FsGroupComponent } from "./fs-group/fs-group.component";
import { MatMenuModule } from "@angular/material/menu";
import { GrantAccessDialogComponent } from "./grant-access-dialog/grant-access-dialog.component";
import { ManageTagDialogComponent } from "./manage-tag-dialog/manage-tag-dialog.component";
import { PdfViewerComponent } from "./pdf-viewer/pdf-viewer.component";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTabsModule } from "@angular/material/tabs";
import { GalleryComponent } from "./gallery/gallery.component";
import { GalleryImageComponent } from "./gallery-image/gallery-image.component";
import { MatCardModule } from "@angular/material/card";
import { FolderComponent } from "./folder/folder.component";
import { MatListModule } from "@angular/material/list";
import { HClient as HttpWrapper } from "./util/api-util";
import { ControlledPaginatorComponent } from './controlled-paginator/controlled-paginator.component';
import { MediaStreamerComponent } from './media-streamer/media-streamer.component';
import { FileTaskComponent } from './file-task/file-task.component';

@NgModule({
  exports: [],
  declarations: [
    PdfViewerComponent,
    AppComponent,
    HomePageComponent,
    LoginComponent,
    NavComponent,
    ManageExtensionComponent,
    ConfirmDialogComponent,
    FsGroupComponent,
    GrantAccessDialogComponent,
    ManageTagDialogComponent,
    ImageViewerComponent,
    GalleryComponent,
    GalleryImageComponent,
    FolderComponent,
    ControlledPaginatorComponent,
    MediaStreamerComponent,
    FileTaskComponent,
  ],
  imports: [
    MatTabsModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    PdfJsViewerModule,
    MatMenuModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    LightboxModule,
    MatListModule,
  ],
  entryComponents: [
    ConfirmDialogComponent,
    GrantAccessDialogComponent,
    ManageTagDialogComponent,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: APP_BASE_HREF, useValue: "/" },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RespInterceptor, multi: true },
    HttpWrapper
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
