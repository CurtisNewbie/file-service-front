import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { ListTagsForFileResp, Tag } from "src/models/file-info";
import { PagingController } from "src/models/paging";
import { NotificationService } from "../notification.service";
import { HClient } from "../util/api-util";

export interface ManageTagDialogData {
  fileId: number;
  filename: string;
  autoComplete: string[];
}

@Component({
  selector: "app-manage-tag-dialog",
  templateUrl: "./manage-tag-dialog.component.html",
  styleUrls: ["./manage-tag-dialog.component.css"],
})
export class ManageTagDialogComponent implements OnInit {

  readonly COLUMN_TO_BE_DISPLAYED: string[] = [
    "id",
    "tagName",
    "createTime",
    "createBy",
    "removeButton",
  ];
  tagName: string = "";
  tags: Tag[] = [];
  acTags: string[] = [];
  filtered: string[] = [];
  pagingController: PagingController;

  constructor(
    private notifi: NotificationService,
    private http: HClient,
    public dialogRef: MatDialogRef<
      ManageTagDialogComponent,
      ManageTagDialogData
    >,
    @Inject(MAT_DIALOG_DATA) public data: ManageTagDialogData
  ) {
    this.acTags = data.autoComplete;

  }

  ngOnInit() {

  }

  tagFile(): void {
    if (!this.tagName) {
      this.notifi.toast("Enter tag name first");
      return;
    }

    this.http.post<void>(
      environment.fileServicePath, "/file/tag/",
      { fileId: this.data.fileId, tagName: this.tagName },
    ).subscribe({
      next: (resp) => this.fetchTags(),
      complete: () => (this.tagName = null),
    });
  }

  fetchTags(): void {
    this.http.post<any>(
      environment.fileServicePath, "/file/tag/list-for-file",
      { fileId: this.data.fileId, pagingVo: this.pagingController.paging },
    ).subscribe({
      next: (resp) => {
        this.tags = [];
        if (resp.data.payload) {
          for (let r of resp.data.payload) {
            if (r.createTime) r.createTime = new Date(r.createTime);
            this.tags.push(r);
          }
        }
        this.pagingController.onTotalChanged(resp.data.pagingVo);
      },
    });
  }

  untag(tagName: string): void {
    this.http.post<void>(
      environment.fileServicePath, "/file/untag/",
      { fileId: this.data.fileId, tagName: tagName },
    ).subscribe({
      next: (resp) => {
        this.fetchTags();
      },
    });
  }

  onTagNameChanged() {
    this.filtered = this.filter(this.tagName);
    console.log(`Autocomplete: ${this.acTags}`);
  }

  private filter(value: string): string[] {
    if (!value) return this.acTags;

    return this.acTags.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }

  onPagingControllerReady(pc) {
    this.pagingController = pc;
    this.pagingController.onPageChanged = () => this.fetchTags();
    this.fetchTags();
  }
}
