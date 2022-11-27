import { Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  FsGroup,
  FsGroupMode,
  FS_GROUP_MODE_OPTIONS,
  FS_GROUP_TYPE_OPTIONS,
  NewFsGroup,
} from "src/models/fs-group";
import { PagingController } from "src/models/paging";
import { animateElementExpanding, getExpanded, isIdEqual } from "../../animate/animate-util";
import { NotificationService } from "../notification.service";
import { HClient } from "../util/api-util";
import { resolveSize } from "../util/file";

@Component({
  selector: "app-fs-group",
  templateUrl: "./fs-group.component.html",
  styleUrls: ["./fs-group.component.css"],
  animations: [animateElementExpanding()],
})
export class FsGroupComponent implements OnInit {

  readonly MODE_READ_ONLY: FsGroupMode = FsGroupMode.READ;
  readonly MODE_READ_WRITE: FsGroupMode = FsGroupMode.READ_WRITE;
  readonly COLUMNS_TO_BE_DISPLAYED: string[] = [
    "id",
    "name",
    "baseFolder",
    "mode",
    "type",
    "size",
    "scanTime",
    "updateBy",
    "updateTime",
  ];
  readonly FS_GROUP_MODE_SELECT_OPTIONS = FS_GROUP_MODE_OPTIONS;
  readonly FS_GROUP_TYPE_SELECT_OPTIONS = FS_GROUP_TYPE_OPTIONS;

  expandedElement: FsGroup = null;
  fsGroups: FsGroup[] = [];
  searchParam: FsGroup = {};
  pagingController: PagingController;
  newFsGroup: NewFsGroup = {};
  addingFsGroup: boolean = false;

  idEquals = isIdEqual;
  getExpandedEle = (row) => getExpanded(row, this.expandedElement);

  constructor(private http: HClient, private toaster: NotificationService) {

  }

  ngOnInit() {
  }

  addFsGroup() {
    if (!this.newFsGroup) {
      this.newFsGroup = {};
      return;
    }
    if (!this.newFsGroup.name) {
      this.toaster.toast("Please enter new FsGroup name")
      return;
    }

    if (this.newFsGroup.baseFolder) this.newFsGroup.baseFolder = this.newFsGroup.baseFolder.trim();
    if (!this.newFsGroup.baseFolder) {
      this.toaster.toast("Please enter new FsGroup folder")
      return;
    }

    if (!this.newFsGroup.type) {
      this.toaster.toast("Please select new FsGroup type")
      return;
    }

    this.http.post<void>(
      environment.fileServicePath, "fsgroup/add", this.newFsGroup
    ).subscribe({
      next: (resp) => {
        this.toaster.toast("FsGroup created");
        this.newFsGroup = {};
        this.addingFsGroup = !this.addingFsGroup;
        this.fetchFsGroups();
      }
    });
  }

  fetchFsGroups() {
    this.http.post<any>(
      environment.fileServicePath, "/fsgroup/list",
      {
        fsGroup: this.searchParam,
        pagingVo: this.pagingController.paging,
      },
    ).subscribe({
      next: (resp) => {
        this.fsGroups = [];
        if (resp.data.payload) {
          this.fsGroups = [];
          if (resp.data.payload) {
            this.fsGroups = resp.data.payload.map(f => {
              if (f.createTime) f.createTime = new Date(f.createTime);
              if (f.scanTime) f.scanTime = new Date(f.scanTime);
              f.sizeLabel = resolveSize(f.size);
              return f;
            });
          }
        }
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  /** Update fs_group's mode */
  updateMode(fs: FsGroup): void {
    this.http.post<any>(
      environment.fileServicePath, "/fsgroup/mode/update",
      {
        id: fs.id,
        mode: fs.mode,
      },
    ).subscribe({
      next: (r) => {
        this.expandedElement = null;
        this.fetchFsGroups();
      },
    });
  }

  searchNameInputKeyPressed(event: any): void {
    if (event.key === "Enter") {
      console.log("enter");
      this.fetchFsGroups();
    }
  }

  onPagingControllerReady(pc: PagingController) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchFsGroups();
    this.fetchFsGroups();
  }
}
