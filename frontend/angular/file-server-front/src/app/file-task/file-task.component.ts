import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PagingController } from 'src/models/paging';
import { UserService } from '../user.service';
import { HClient, buildApiPath } from '../util/api-util';
import { time } from '../util/date-util';

export interface FileTask {
  taskNo?: string
  type?: string
  status?: string
  description?: string
  fileKey?: string
  startTime?: Date
  endTime?: Date
  remark?: string
}

@Component({
  selector: 'app-file-task',
  templateUrl: './file-task.component.html',
  styleUrls: ['./file-task.component.css']
})
export class FileTaskComponent implements OnInit {

  readonly titles = ["taskNo", "type", "status", "description", "startTime", "endTime", "remark", "operation"];
  pagingController: PagingController;
  fileTaskList: FileTask[] = [];

  constructor(private userService: UserService, private hclient: HClient) { }

  ngOnInit(): void {
    this.userService.fetchUserInfo();
    this.fetchFileTaskList();
  }

  fetchFileTaskList() {
    this.hclient.post<any>(environment.fileServicePath, "/file/task/list", this.pagingController.paging)
      .subscribe({
        next: (resp) => {
          this.fileTaskList = [];

          if (!resp.data.payload) return;

          for (let r of resp.data.payload) {
            if (r.startTime) r.startTime = new Date(r.startTime);
            if (r.endTime) r.endTime = new Date(r.endTime);
            this.fileTaskList.push(r);
          }

          this.pagingController.onTotalChanged(resp.data.pagingVo);
        }
      })
  }

  /**
   * Fetch download url and open it in a new tab
   */
  jumpToDownloadUrl(fileKey: string): void {
    this.hclient.post<string>(
      environment.fileServicePath, "/file/token/generate",
      { fileKey: fileKey, tokenType: "DOWNLOAD" },
    ).subscribe({
      next: (resp) => {
        const token = resp.data;
        const url = buildApiPath("/file/token/download?token=" + token, environment.fileServicePath);
        window.open(url, "_parent");
      },
    });
  }

  onPagingControllerReady(pagingController: PagingController) {
    console.log("onPagingControllerReady", time());
    this.pagingController = pagingController;
    this.pagingController.onPageChanged = () => this.fetchFileTaskList();
    this.fetchFileTaskList();
  }
}
