import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { FileAccessGranted } from "src/models/file-info";
import { PagingController } from "src/models/paging";
import { NotificationService } from "../notification.service";
import { HClient } from "../util/api-util";

export interface GrantAccessDialogData {
  fileId: number;
  fileName: string;
}

@Component({
  selector: "app-grant-access-dialog",
  templateUrl: "./grant-access-dialog.component.html",
  styleUrls: ["./grant-access-dialog.component.css"],
})
export class GrantAccessDialogComponent implements OnInit {

  readonly COLUMN_TO_BE_DISPLAYED: string[] = [
    "userId",
    "username",
    "createDate",
    "createdBy",
    "removeButton",
  ];
  grantedTo: string = "";
  grantedAccesses: FileAccessGranted[] = [];
  pagingController: PagingController;

  constructor(
    private http: HClient,
    private notifi: NotificationService,
    public dialogRef: MatDialogRef<
      GrantAccessDialogComponent,
      GrantAccessDialogData
    >,
    @Inject(MAT_DIALOG_DATA) public data: GrantAccessDialogData
  ) {

  }

  ngOnInit() {

  }

  grantAccess() {
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

  fetchAccessGranted() {
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

  removeAccess(userId: number): void {
    this.http.post<void>(
      environment.fileServicePath, "/file/remove-granted-access",
      {
        userId: userId,
        fileId: this.data.fileId,
      },
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
