import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { FileAccessGranted } from "src/models/file-info";
import { PagingController } from "src/models/paging";
import { NotificationService } from "../notification.service";
import { HClient } from "../util/api-util";
import { isEnterKey } from "../util/condition";

export enum GrantTarget {
  FILE, FOLDER
}

export interface GrantAccessDialogData {
  fileId?: number;
  folderNo?: string;
  name: string;
  target: GrantTarget;  
}

@Component({
  selector: "app-grant-access-dialog",
  templateUrl: "./grant-access-dialog.component.html",
  styleUrls: ["./grant-access-dialog.component.css"],
})
export class GrantAccessDialogComponent implements OnInit {
  readonly columns: string[] = [
    "username",
    "createDate",
    "removeButton",
  ];
  grantedTo: string = "";
  grantedAccesses: FileAccessGranted[] = [];
  pagingController: PagingController;
  isEnterPressed = isEnterKey;

  constructor(
    private http: HClient,
    private notifi: NotificationService,
    public dialogRef: MatDialogRef< GrantAccessDialogComponent, GrantAccessDialogData >,
    @Inject(MAT_DIALOG_DATA) public data: GrantAccessDialogData
  ) {
  }

  ngOnInit() {

  }

  grantAccess() {
    if (this.isForFolder()) this.grantFolderAccess();      
    else this.grantFileAccess();
  }

  grantFileAccess() {
    if (!this.grantedTo) {
      this.notifi.toast("Enter username first");
      return;
    }

    this.http.post<void>(
      environment.fileServicePath, "/file/grant-access",
      {
        fileId: this.data.fileId,
        grantedTo: this.grantedTo,
      },
    ).subscribe({
      next: () => {
        this.notifi.toast("Access granted");
        this.fetchAccessGranted();
      },
    });
  }

  grantFolderAccess() {
    if (!this.grantedTo) {
      this.notifi.toast("Enter username first");
      return;
    }

    this.http.post<void>(
      environment.fileServicePath, "/vfolder/share",
      {
        folderNo: this.data.folderNo,
        username: this.grantedTo,
      },
    ).subscribe({
      next: () => {
        this.notifi.toast("Access granted");
        this.fetchAccessGranted();
      },
    });
  }


  fetchAccessGranted() {
    if (this.isForFolder()) this.fetchFolderAccessGranted();
    else this.fetchFileAccessGranted();
  }

  fetchFolderAccessGranted() {
    this.http.post<any>(
      environment.fileServicePath, "/vfolder/granted/list",
      {
        folderNo: this.data.folderNo,
        pagingVo: this.pagingController.paging,
      },
    ).subscribe({
      next: (resp) => {
        this.grantedAccesses = [];
        if (resp.data.payload) {
          for (let g of resp.data.payload) {
            g.createDate = new Date(g.createTime);
            this.grantedAccesses.push(g);
          }
        }
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  fetchFileAccessGranted() {
    this.http.post<any>(
      environment.fileServicePath, "/file/list-granted-access",
      {
        fileId: this.data.fileId,
        pagingVo: this.pagingController.paging,
      },
    ).subscribe({
      next: (resp) => {
        this.grantedAccesses = [];
        if (resp.data.list) {
          for (let g of resp.data.list) {
            g.createDate = new Date(g.createDate);
            this.grantedAccesses.push(g);
          }
        }
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  isForFolder() : boolean {
    return this.data.target == GrantTarget.FOLDER;
  }

  removeAccess(access): void {
    if (this.isForFolder()) this.removeFolderAccess(access.userNo);
    else this.removeFileAccess(access.userId);
  }

  removeFolderAccess(userNo: string): void {
    this.http.post<void>(
      environment.fileServicePath, "/vfolder/access/remove",
      { userNo: userNo, folderNo: this.data.folderNo },
    ).subscribe({
      next: () => {
        this.fetchAccessGranted();
      },
    });
  }

  removeFileAccess(userId: number): void {
    this.http.post<void>(
      environment.fileServicePath, "/file/remove-granted-access",
      { userId: userId, fileId: this.data.fileId },
    ).subscribe({
      next: () => {
        this.fetchAccessGranted();
      },
    });
  }

  onPagingControllerReady(pc) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchAccessGranted();
    this.fetchAccessGranted();
  }
}
