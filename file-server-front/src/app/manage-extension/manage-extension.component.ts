import { Component, OnInit } from "@angular/core";
import {
  emptySearchFileExtParam,
  FileExt,
  FileExtIsEnabled,
  FileExtIsEnabledOption,
  FILE_EXT_IS_ENABLED_OPTIONS,
  SearchFileExtParam,
} from "src/models/file-ext";
import { PagingController } from "src/models/paging";
import { NotificationService } from "../notification.service";
import { animateElementExpanding } from "../../animate/animate-util";
import { isMobile } from "../util/env-util";
import { environment } from "src/environments/environment";
import { HClient } from "../util/api-util";

@Component({
  selector: "app-manage-extension",
  templateUrl: "./manage-extension.component.html",
  styleUrls: ["./manage-extension.component.css"],
  animations: [animateElementExpanding()],
})
export class ManageExtensionComponent implements OnInit {

  readonly FILE_EXT_ENABLED: number = FileExtIsEnabled.ENABLED;
  readonly FILE_EXT_DISABLED: number = FileExtIsEnabled.DISABLED;
  readonly DESKTOP_COLUMNS_TO_BE_DISPLAYED: string[] = [
    "id",
    "name",
    "status",
    "createBy",
    "createTime",
    "updateBy",
    "updateTime",
  ];
  readonly MOBILE_COLUMNS_TO_BE_DISPLAYED: string[] = ["id", "name", "status"];
  readonly FILE_EXT_IS_ENABLED_OPTIONS: FileExtIsEnabledOption[] =
    FILE_EXT_IS_ENABLED_OPTIONS;

  pagingController: PagingController;
  fileExt: FileExt[] = [];
  updateExt: FileExt;
  searchParam: SearchFileExtParam = emptySearchFileExtParam();
  expandedElement: FileExt = null;
  addExtPanelDisplayed: boolean = false;
  extToBeAdded: string = null;
  isMobile: boolean = isMobile();

  private isSearchParamChagned: boolean = false;

  constructor(
    private http: HClient,
    private notifi: NotificationService,
  ) {

  }

  ngOnInit() {

  }

  /** fetch supported file extension */
  fetchSupportedExtensionsDetails(): void {
    if (this.isSearchParamChagned) {
      this.isSearchParamChagned = false;
      this.pagingController.firstPage();
    }
    this.searchParam.pagingVo = this.pagingController.paging;

    this.http.post<any>(
      environment.fileServicePath, "/file/extension/list",
      this.searchParam,
    ).subscribe({
      next: (resp) => {
        this.fileExt = [];
        if (resp.data.payload) {
          for (let r of resp.data.payload) {
            if (r.updateTime) r.updateTime = new Date(r.updateTime);
            if (r.createTime) r.createTime = new Date(r.createTime);
            this.fileExt.push(r);
          }
        }
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  /** Update file extension */
  updateFileExt(): void {
    this.http.post<FileExt[]>(
      environment.fileServicePath, "/file/extension/update",
      this.updateExt,
    ).subscribe({
      next: (resp) => {
        this.updateExt = null;
        this.fetchSupportedExtensionsDetails();
      },
    });
  }

  enableFileExt(fe: FileExt) {
    this.updateFileIsEnabled(fe, FileExtIsEnabled.ENABLED);
  }

  disableFileExt(fe: FileExt) {
    this.updateFileIsEnabled(fe, FileExtIsEnabled.DISABLED);
  }

  updateFileIsEnabled(fe: FileExt, targetIsEnabled: number): void {
    this.updateExt = fe;
    // if it's the correct value already, skip it
    if (this.updateExt.isEnabled === targetIsEnabled) {
      return;
    }
    this.updateExt.isEnabled = targetIsEnabled;
    this.updateFileExt();
  }

  searchNameInputKeyPressed(event: any): void {
    if (event.key === "Enter") {
      this.fetchSupportedExtensionsDetails();
    }
  }

  addFileExt(): void {
    let ext: string = this.extToBeAdded;
    if (ext == null || ext.trim() == "") {
      this.notifi.toast("Please enter file extension");
      return;
    }
    ext = ext.trim();
    if (!ext.match(/[0-9a-zA-Z]+/)) {
      this.notifi.toast(
        "File extension should only contains alphabets and numbers"
      );
      return;
    }

    this.http.post<void>(
      environment.fileServicePath, "/file/extension/add",
      { name: ext },
    ).subscribe({
      next: (resp) => {
        this.notifi.toast(`File extension '${ext}' added`);
      },
      complete: () => {
        this.addExtPanelDisplayed = false;
        this.fetchSupportedExtensionsDetails();
      },
    });
  }

  onPagingControllerReady(pc) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchSupportedExtensionsDetails();
    this.fetchSupportedExtensionsDetails();
  }
}
