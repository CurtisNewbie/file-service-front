import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Folder } from "src/models/folder";
import { PagingController } from "src/models/paging";

@Component({
  selector: "app-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.css"],
})
export class FolderComponent implements OnInit {
  searchParam: { name: string } = {
    name: "",
  };
  pagingController: PagingController = new PagingController();

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

  constructor() {}

  ngOnInit(): void {}

  handle(e: PageEvent): void {
    this.pagingController.handle(e);
    this.fetchFolders();
  }

  fetchFolders(): void {}
}
