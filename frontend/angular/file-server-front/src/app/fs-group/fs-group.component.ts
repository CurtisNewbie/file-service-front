import { Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  FsGroup,
  FsGroupMode,
  FS_GROUP_MODE_OPTIONS,
} from "src/models/fs-group";
import { PagingController } from "src/models/paging";
import { animateElementExpanding, getExpanded, isIdEqual } from "../../animate/animate-util";
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

  expandedElement: FsGroup = null;
  fsGroups: FsGroup[] = [];
  searchParam: FsGroup = {};
  pagingController: PagingController;

  idEquals = isIdEqual;
  getExpandedEle = (row) => getExpanded(row, this.expandedElement);

  constructor(private http: HClient) {

  }

  ngOnInit() {
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
        this.fsGroups = resp.data.payload.map(f => {
          f.sizeLabel = resolveSize(f.size);
          return f;
        });
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
