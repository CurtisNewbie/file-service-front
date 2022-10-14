import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { VFolder, FolderListResp } from "src/models/folder";
import { Paging, PagingController } from "src/models/paging";
import { Resp } from "src/models/resp";
import { NavigationService, NavType } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { buildApiPath, buildOptions } from "../util/api-util";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.css"],
})
export class FolderComponent implements OnInit {
  pagingController: PagingController;
  newFolderName: string = "";
  creatingFolder: boolean = false;
  searchParam: { name: string; pagingVo: Paging } = {
    name: "",
    pagingVo: null,
  };
  folders: VFolder[] = [];

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private navi: NavigationService
  ) {
  }

  ngOnInit(): void {
  }

  selectFolder(f: VFolder): void {
    this.navi.navigateTo(NavType.HOME_PAGE, [
      { folderNo: f.folderNo, folderName: f.name },
    ]);
  }

  fetchFolders(): void {
    this.searchParam.pagingVo = this.pagingController.paging;
    this.http
      .post<Resp<FolderListResp>>(
        buildApiPath("/vfolder/list", environment.fileServicePath),
        this.searchParam,
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.folders = resp.data.payload;
          this.pagingController.onTotalChanged(resp.data.pagingVo);
        },
      });
  }

  resetSearchParam(): void {
    this.searchParam.name = "";
    this.fetchFolders();
  }

  createFolder(): void {
    if (!this.newFolderName) {
      this.notification.toast("Please enter folder name");
      return;
    }

    this.creatingFolder = false;
    this.http
      .post<Resp<void>>(
        buildApiPath("/vfolder/create", environment.fileServicePath),
        { name: this.newFolderName },
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          console.log("Created folder, ", resp.data);
          this.fetchFolders();
          this.newFolderName = "";
        },
      });
  }

  onPagingControllerReady(pc: PagingController) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchFolders();
    this.pagingController.PAGE_LIMIT_OPTIONS = [5, 10];
    this.pagingController.paging.limit =
      this.pagingController.PAGE_LIMIT_OPTIONS[0];
    this.fetchFolders();
  }
}
