import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { environment } from "src/environments/environment";
import {
  emptyFsGroup,
  FsGroup,
  FsGroupMode,
  FS_GROUP_MODE_OPTIONS,
} from "src/models/fs-group";
import { PagingController } from "src/models/paging";
import { animateElementExpanding } from "../../animate/animate-util";
import { FileInfoService } from "../file-info.service";
import { HClient } from "../util/api-util";

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
    "updateBy",
    "updateTime",
  ];
  readonly FS_GROUP_MODE_SELECT_OPTIONS = FS_GROUP_MODE_OPTIONS;

  expandedElement: FsGroup = null;
  fsGroups: FsGroup[] = [];
  searchParam: FsGroup = emptyFsGroup();
  pagingController: PagingController;

  @ViewChild("paginator", { static: true })
  paginator: MatPaginator;

  constructor(private http: HClient) {
    this.pagingController = new PagingController();
    this.pagingController.onPageChanged = () => this.fetchFsGroups();
  }

  ngOnInit() {
    this.pagingController.control(this.paginator);
    this.fetchFsGroups();
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
        this.fsGroups = resp.data.payload;
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  /**
   * Look at the row, determine whether we should expand this row (return this row)
   *
   * @param row null value if we shouldn't expand this element, else a copy of this row
   * @returns expandedElement
   */
  determineExpandedElement(row: FsGroup): FsGroup {
    return this.idEquals(row, this.expandedElement) ? null : this.copy(row);
  }

  copy(f: FsGroup): FsGroup {
    if (!f) return null;
    return { ...f };
  }

  /**
   * Check if the two fs_group's id are equals
   */
  idEquals(fsl: FsGroup, fsr: FsGroup): boolean {
    if (fsl == null || fsr == null) return false;
    return fsl.id === fsr.id;
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
}
