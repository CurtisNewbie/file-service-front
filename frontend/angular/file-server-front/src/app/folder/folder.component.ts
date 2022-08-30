import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Folder, FolderListResp } from "src/models/folder";
import { Paging, PagingController } from "src/models/paging";
import { Resp } from "src/models/resp";
import { NotificationService } from "../notification.service";
import { buildApiPath, buildOptions } from "../util/api-util";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.css"],
})
export class FolderComponent implements OnInit {
  newFolderName: string = "";
  creatingFolder: boolean = false;
  searchParam: { name: string; pagingVo: Paging } = {
    name: "",
    pagingVo: null,
  };
  pagingController: PagingController;

  folders: Folder[] = [
    {
      id: 1,
      name: "Mega Monga",
      createBy: "Yongj Zhuang",
      createTime: "2022-08-29 23:24:38",
      updateBy: "Yongj Zhuang",
      updateTime: "2022-08-29 23:24:38",
      folderNo: "A123123123",
      ownership: "OWNER",
    },
    {
      id: 2,
      name: "Secret stuff",
      createBy: "Yongj Zhuang",
      createTime: "2022-08-29 23:24:38",
      updateBy: "Yongj Zhuang",
      updateTime: "2022-08-29 23:24:38",
      folderNo: "A123123123",
      ownership: "OWNER",
    },
    {
      id: 3,
      name: "What is it?",
      createBy: "Yongj Zhuang",
      createTime: "2022-08-29 23:24:38",
      updateBy: "Yongj Zhuang",
      updateTime: "2022-08-29 23:24:38",
      folderNo: "A123123123",
      ownership: "OWNER",
    },
  ];

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {
    this.pagingController = new PagingController();
    this.pagingController.onPageChanged = () => this.fetchFolders();
    this.pagingController.PAGE_LIMIT_OPTIONS = [5, 10];
    this.pagingController.paging.limit =
      this.pagingController.PAGE_LIMIT_OPTIONS[0];
  }

  ngOnInit(): void {
    this.fetchFolders();
  }

  fetchFolders(): void {
    this.searchParam.pagingVo = this.pagingController.paging;
    this.http
      .post<Resp<FolderListResp>>(
        buildApiPath("/vfolder/list"),
        this.searchParam,
        buildOptions()
      )
      .subscribe({
        next: (resp) => {
          this.folders = resp.data.payload;
          this.pagingController.updatePages(resp.data.pagingVo.total);
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
        buildApiPath("/vfolder/create"),
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
}
