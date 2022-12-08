import { HttpClient } from "@angular/common/http";
import { Component, DoCheck, OnInit, ViewChild } from "@angular/core";
import { MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { environment } from "src/environments/environment";
import { VFolder } from "src/models/folder";
import { Paging, PagingController } from "src/models/paging";
import { Resp } from "src/models/resp";
import { NavigationService, NavType } from "../navigation.service";
import { NotificationService } from "../notification.service";
import { buildApiPath, buildOptions } from "../util/api-util";
import { isEnterKey } from "../util/condition";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.css"],
})
export class FolderComponent implements OnInit, DoCheck {
  pagingController: PagingController;
  newFolderName: string = "";
  creatingFolder: boolean = false;
  searchParam: { name: string; pagingVo: Paging } = {
    name: "",
    pagingVo: null,
  };
  folders: VFolder[] = [];
  selected: VFolder[] = [];
  onEnterPressed = isEnterKey;
  isOneSelected: boolean;

  @ViewChild("folderList")
  folderList: MatSelectionList;

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private navi: NavigationService
  ) {
  }

  ngDoCheck(): void {
    if (!this.folderList) {
      this.isOneSelected = false;
      return;
    }

    let selected = this.folderList.selectedOptions.selected;
    this.isOneSelected = selected.length == 1;
  }

  selectionChanged(event: MatSelectionListChange): void {
    this.selected = event.options.filter(o => o.selected).map(o => o.value);
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
      .post<Resp<any>>(
        buildApiPath("/vfolder/list", environment.fileServicePath),
        this.searchParam,
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.folders = [];
          if (resp.data.payload) {
            this.folders = resp.data.payload.map(r => {
              if (r.createTime) r.createTime = new Date(r.createTime);
              if (r.updateTime) r.updateTime = new Date(r.updateTime);
              return r;
            });
          }
          this.pagingController.onTotalChanged(resp.data.pagingVo);
        },
      });
  }

  resetSearchParam(): void {
    this.searchParam.name = "";
    this.folderList.deselectAll();
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
