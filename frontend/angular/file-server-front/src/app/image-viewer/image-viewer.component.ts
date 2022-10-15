import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface ImgViewerDialogData {
  name: string;
  url: string;
}

@Component({
  selector: "app-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.css"],
})
export class ImageViewerComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ImageViewerComponent, ImgViewerDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: ImgViewerDialogData
  ) { }

  ngOnInit() {
  }

}
