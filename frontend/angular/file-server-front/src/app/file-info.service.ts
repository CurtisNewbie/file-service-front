import { HttpClient, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import {
  UploadFileParam,
} from "src/models/file-info";
import { buildApiPath, getToken } from "./util/api-util";

@Injectable({
  providedIn: "root",
})
export class FileInfoService {
  constructor(private http: HttpClient) { }

  /**
   * Post file with given name
   * @param uploadName
   * @param uploadFile
   */
  public postFile(uploadParam: UploadFileParam): Observable<HttpEvent<any>> {
    if (!environment.production) console.log("postFile", uploadParam);
    if (uploadParam.files.length > 1) return this._postFileViaForm(uploadParam);
    else return this._postFileViaStream(uploadParam);
  }

  private _postFileViaForm(
    uploadParam: UploadFileParam
  ): Observable<HttpEvent<any>> {
    let formData = new FormData();
    formData.append("fileName", uploadParam.fileName);
    formData.append("userGroup", uploadParam.userGroup.toString());

    if (uploadParam.parentFile) {
      formData.append("parentFile", uploadParam.parentFile);
    }

    if (uploadParam.tags) {
      for (let t of uploadParam.tags) {
        formData.append("tag", t);
      }
    }

    for (let f of uploadParam.files) {
      formData.append("file", f);
    }

    return this.http.post<HttpEvent<any>>(
      buildApiPath("/file/upload", environment.fileServicePath),
      formData,
      {
        observe: "events",
        reportProgress: true,
        withCredentials: true,
        headers: new HttpHeaders({
          Authorization: getToken(),
        }),
      }
    );
  }

  private _postFileViaStream(
    uploadParam: UploadFileParam
  ): Observable<HttpEvent<any>> {
    let headers = new HttpHeaders()
      .append("fileName", encodeURI(uploadParam.fileName))
      .append("Authorization", getToken())
      .append("userGroup", uploadParam.userGroup.toString())
      .append("ignoreOnDupName", uploadParam.ignoreOnDupName.toString())
      .append("Content-Type", "application/octet-stream");

    if (uploadParam.parentFile) {
      headers = headers.append("parentFile", encodeURI(uploadParam.parentFile));
    }

    if (uploadParam.tags) headers = headers.append("tag", uploadParam.tags);

    console.log("headers", headers);

    return this.http.post<HttpEvent<any>>(
      buildApiPath("/file/upload/stream", environment.fileServicePath),
      uploadParam.files[0],
      {
        observe: "events",
        reportProgress: true,
        withCredentials: true,
        headers: headers,
      }
    );
  }
}
