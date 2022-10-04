import { HttpEventType } from "@angular/common/http";
import {
  Component,
  DoCheck,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable, Subscription, timer } from "rxjs";

import {
  DirBrief,
  emptyUploadFileParam,
  FetchFileInfoList,
  FileInfo,
  FileOwnershipEnum,
  FileOwnershipOption,
  FileType,
  FileUserGroupEnum,
  FileUserGroupOption,
  FILE_OWNERSHIP_OPTIONS,
  FILE_USER_GROUP_OPTIONS,
  SearchFileInfoParam,
  UploadFileParam,
} from "src/models/file-info";
import { PagingController } from "src/models/paging";
import { ConfirmDialogComponent } from "../dialog/confirm/confirm-dialog.component";
import { NotificationService } from "../notification.service";
import { UserService } from "../user.service";
import { animateElementExpanding, getExpanded, isIdEqual } from "../../animate/animate-util";
import { buildApiPath, HClient } from "../util/api-util";
import { FileInfoService } from "../file-info.service";
import { GrantAccessDialogComponent } from "../grant-access-dialog/grant-access-dialog.component";
import { ManageTagDialogComponent } from "../manage-tag-dialog/manage-tag-dialog.component";
import { NavigationService, NavType } from "../navigation.service";
import { isMobile } from "../util/env-util";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";
import { Resp } from "src/models/resp";
import { VFolderBrief } from "src/models/folder";
import { GalleryBrief } from "src/models/gallery";
import { ImageViewerComponent } from "../image-viewer/image-viewer.component";
import { onLangChange, translate } from "src/models/translate";
import { resolveSize } from "../util/file";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.css"],
  animations: [animateElementExpanding()],
})
export class HomePageComponent implements OnInit, OnDestroy, DoCheck {

  readonly fantahseaEnabled: boolean =
    environment.services.find((v) => v.base === "fantahsea") != null;
  readonly OWNERSHIP_ALL_FILES = FileOwnershipEnum.FILE_OWNERSHIP_ALL_FILES;
  readonly OWNERSHIP_MY_FILES = FileOwnershipEnum.FILE_OWNERSHIP_MY_FILES;
  readonly PRIVATE_GROUP = FileUserGroupEnum.USER_GROUP_PRIVATE;
  readonly PUBLIC_GROUP = FileUserGroupEnum.USER_GROUP_PUBLIC;
  readonly USER_GROUP_OPTIONS: FileUserGroupOption[] = FILE_USER_GROUP_OPTIONS.map(v => {
    let t = { ...v }
    t.name = translate(t.name);
    return t;
  });
  readonly FILE_OWNERSHIP_OPTIONS: FileOwnershipOption[] =
    FILE_OWNERSHIP_OPTIONS.map(v => {
      let t = { ...v }
      t.name = translate(t.name);
      return t;
    });
  readonly DESKTOP_COLUMNS = [
    "selected",
    "fileType",
    "name",
    "uploader",
    "uploadTime",
    "size",
    "userGroup",
    "updateTime",
    "operation",
  ];
  readonly DESKTOP_FOLDER_COLUMNS = [
    "name",
    "uploader",
    "uploadTime",
    "size",
    "userGroup",
    "operation",
  ];
  readonly MOBILE_COLUMNS = ["fileType", "name", "operation"];
  readonly IMAGE_SUFFIX = new Set(["jpeg", "jpg", "gif", "png", "svg", "bmp"]);
  readonly fetchTagTimerSub = timer(5000, 30_000).subscribe((val) =>
    this._fetchTags()
  );

  /** expanded fileInfo */
  expandedElement: FileInfo;

  /** file extension name set */
  fileExtSet: Set<string> = new Set();

  /** list of files fetched */
  fileInfoList: FileInfo[] = [];

  /** searching param */
  searchParam: SearchFileInfoParam = {}

  /** whether current user is a guest */
  isGuest: boolean = true;

  /** controller for pagination */
  pagingController: PagingController;

  /** progress string */
  progress: string = null;

  /** all accessible tags */
  tags: string[];

  /** tags selected for the uploaded files */
  selectedTags: string[] = [];

  /** whether current user is using mobile device */
  isMobile: boolean = false;

  /** check if all files are selected */
  isAllSelected: boolean = false;

  /** title of the list section */
  fileListTitle: string = null;

  /** currently displayed columns */
  displayedColumns: string[] = this._selectColumns();

  idEquals = isIdEqual;
  getExpandedEle = (row) => getExpanded(row, this.expandedElement, this.isMobile);

  /*
  -----------------------

  Fantahsea gallery 

  -----------------------
  */

  /** list of brief info of all galleries that we created */
  galleryBriefs: GalleryBrief[] = [];
  /** name of fantahsea gallery that we may transfer files to */
  addToGalleryName: string = null;
  /** Auto complete for fantahsea gallery that we may transfer files to */
  autoCompAddToGalleryName: string[];

  /*
  -----------------------

  Virtual Folders 

  -----------------------
  */

  /** list of brief info of all vfolder that we created */
  vfolderBrief: VFolderBrief[] = [];
  /** Auto complete for vfolders that we may add file into */
  autoCompAddToVFolderName: string[];
  /** name of the folder that we may add files into */
  addToVFolderName: string = null;
  /** the folderNo of the folder that we are currently in */
  inFolderNo: string = "";
  /** the name of the folder that we are currently in */
  inFolderName: string = "";

  /*
  -----------------------

  Directory

  -----------------------
  */

  /** list of brief info of all directories that we can access */
  dirBriefList: DirBrief[] = [];
  /** the name of the directory that we are currently in */
  inDirFileName: string = null;
  /** auto complete for dirs that we may move file into */
  autoCompMoveIntoDirs: string[] = [];
  /** name of dir that we may move file into */
  moveIntoDirName: string = null;
  /** whether we are making directory */
  makingDir: boolean = false;
  /** name of new dir */
  newDirName: string = null;


  /*
  -----------------------

  Uploading 

  -----------------------
  */
  /** whther the upload panel is expanded */
  expandUploadPanel = false;
  /** params for uploading */
  uploadParam: UploadFileParam = emptyUploadFileParam();
  /** displayed upload file name */
  displayedUploadName: string = null;
  /** whether uploading involves compression (for multiple files) */
  isCompressed: boolean = false;
  /** whether we are uploading */
  isUploading: boolean = false;
  /** name of directory that we may upload files into */
  uploadDirName: string = null;
  /** auto complete for dirs that we may upload file into */
  autoCompUploadDirs: string[] = [];
  /** Always points to current file, so the next will be uploadIndex+1 */
  uploadIndex = -1;
  /** subscription of current uploading */
  uploadSub: Subscription = null;
  /** Ignore upload on duplicate name found*/
  ignoreOnDupName: boolean = true;

  /*
  ----------------------------------

  Labels 

  ----------------------------------
  */
  onLangChangeSub = onLangChange.subscribe(() => this.refreshLabel());
  filenameLabel: string;
  withTagsLabel: string;
  userGroupLabel: string;
  uploadToDirLabel: string;
  uploadLabel: string;
  cancelLabel: string;
  progressLabel: string;
  singleUploadTipLabel: string;
  multiUploadTipLabel: string;
  compressedLabel: string;
  ignoreOnDupNameLabel: string;
  supportedFileExtLabel: string;
  ownerLabel: string;
  tagsLabel: string;
  fantahseaGalleryLabel: string;
  virtualFolderLabel: string;
  newDirLabel: string;
  dirNameLabel: string;
  hostOnFantahseaLabel: string;
  addToVFolderLabel: string;
  uploadPanelLabel: string;
  mkdirLabel: string;
  fetchLabel: string;
  resetLabel: string;
  selectedLabel: string;
  nameLabel: string;
  uploaderLabel: string;
  uploadTimeLabel: string;
  fileSizeLabel: string;
  fileTypeLabel: string;
  publicGroupLabel: string;
  privateGroupLabel: string;
  updateTimeLabel: string;
  operationLabel: string;
  downloadLabel: string;
  goIntoLabel: string;
  dirLabel: string;
  submitLabel: string;
  exportAsZipLabel: string;

  @ViewChild("uploadFileInput")
  uploadFileInput: ElementRef;

  constructor(
    private userService: UserService,
    private notifi: NotificationService,
    private dialog: MatDialog,
    private fileService: FileInfoService,
    private nav: NavigationService,
    private http: HClient,
    private route: ActivatedRoute
  ) {
    this.userService.roleObservable.subscribe(
      (role) => (this.isGuest = role === "guest")
    );
  }

  refreshLabel(): void {
    this.filenameLabel = translate("filename");
    this.withTagsLabel = translate("withTags");
    this.userGroupLabel = translate("userGroup");
    this.uploadToDirLabel = translate("uploadToDirectory");
    this.uploadLabel = translate("upload");
    this.cancelLabel = translate("cancel");
    this.progressLabel = translate('progress');
    this.singleUploadTipLabel = translate('singleUploadTip');
    this.multiUploadTipLabel = translate('multiUploadTip');
    this.compressedLabel = translate("compressed");
    this.ignoreOnDupNameLabel = translate("ignoreOnDupName");
    this.supportedFileExtLabel = translate("supportedFileExt");
    this.ownerLabel = translate("owner");
    this.tagsLabel = translate('tags');
    this.fantahseaGalleryLabel = translate('fantahseaGallery');
    this.virtualFolderLabel = translate("virtualFolder");
    this.newDirLabel = translate('newDir');
    this.dirNameLabel = translate('dirName');
    this.hostOnFantahseaLabel = translate('hostOnFantahsea');
    this.addToVFolderLabel = translate('addToVFolder');
    this.uploadPanelLabel = translate('uploadPanel');
    this.mkdirLabel = translate('makeDirectory');
    this.fetchLabel = translate('fetch');
    this.resetLabel = translate('reset');
    this.selectedLabel = translate('selected');
    this.nameLabel = translate('name');
    this.uploaderLabel = translate('uploader');
    this.uploadTimeLabel = translate('uploadTime');
    this.fileSizeLabel = translate('fileSize');
    this.fileTypeLabel = translate("type");
    this.publicGroupLabel = translate('publicGroup');
    this.privateGroupLabel = translate('privateGroup');
    this.updateTimeLabel = translate("updateTime");
    this.operationLabel = translate("operation");
    this.downloadLabel = translate('download');
    this.goIntoLabel = translate('goInto');
    this.dirLabel = translate('directory');
    this.submitLabel = translate('submit');
    this.exportAsZipLabel = translate('exportAsZip');
  }

  ngDoCheck(): void {
    this.displayedColumns = this._selectColumns();
    if (this.isCompressed) this.uploadDirName = null;
  }

  ngOnDestroy(): void {
    this.fetchTagTimerSub.unsubscribe();
    this.onLangChangeSub.unsubscribe();
  }

  ngOnInit() {
    this.refreshLabel();
    this.isMobile = isMobile();

    this.route.paramMap.subscribe((params) => {
      // vfolder
      this.inFolderNo = params.get("folderNo");
      this.inFolderName = params.get("folderName");

      // directory
      this.searchParam.parentFileName = params.get("parentDirName");
      this.searchParam.parentFile = params.get("parentDirKey");

      if (this.pagingController) {
        this.pagingController.firstPage();
        this.fetchFileInfoList();
      }

      this.fileListTitle = this._getListTitle();
      this.userService.fetchUserInfo();
      this._fetchSupportedExtensions();
      this._fetchTags();
      this._fetchDirBriefList();
      this._fetchOwnedVFolderBrief();

      if (this.fantahseaEnabled) {
        this._fetchOwnedGalleryBrief();
      }
    });
  }

  // make dir
  mkdir() {
    const dirName = this.newDirName;
    if (!dirName) {
      this.notifi.toast("Please enter new directory name")
      return;
    }

    this.newDirName = null;
    this.http.post(
      environment.fileServicePath, "/file/make-dir",
      {
        name: dirName,
        userGroup: FileUserGroupEnum.USER_GROUP_PRIVATE
      },
    ).subscribe({
      next: () => {
        this.fetchFileInfoList();
        this._fetchDirBriefList();
        this.makingDir = false;
      }
    });
  }

  // Go into dir, i.e., list files under the directory
  goIntoDir(dir: FileInfo, event: any) {
    event.stopPropagation();
    this.expandedElement = null;
    this.nav.navigateTo(NavType.HOME_PAGE, [
      { parentDirName: dir.name, parentDirKey: dir.uuid },
    ]);
  }

  // Move (into/out of) dir
  doMoveToDir(uuid: string, dirName: string, into: boolean = true) {
    if (!uuid) {
      this.notifi.toast("Please select a file first")
      return
    }

    let parentFileUuid;
    if (into) {
      let matched: DirBrief[] = this.dirBriefList.filter(v => v.name === dirName)
      if (!matched || matched.length < 1) {
        this.notifi.toast("Directory not found, please check and try again")
        return
      }
      if (matched.length > 1) {
        this.notifi.toast("Found multiple directories with the same name, please update their names and try again")
        return
      }
      parentFileUuid = matched[0].uuid;
    } else {
      parentFileUuid = "";
    }

    this.http.post(
      environment.fileServicePath, "/file/move-to-dir",
      {
        uuid: uuid,
        parentFileUuid: parentFileUuid,
      },
    ).subscribe({
      complete: () => this.fetchFileInfoList()
    });
  }

  /** fetch file info list */
  fetchFileInfoList() {
    this.http.post<FetchFileInfoList>(
      environment.fileServicePath, "/file/list",
      {
        pagingVo: this.pagingController.paging,
        filename: this.searchParam.name,
        userGroup: this.searchParam.userGroup,
        ownership: this.searchParam.ownership,
        tagName: this.searchParam.tagName,
        folderNo: this.inFolderNo,
        parentFile: this.searchParam.parentFile
      }
    ).subscribe({
      next: (resp) => {
        this.fileInfoList = resp.data.payload;
        for (let f of this.fileInfoList) {
          if (f.fileType) {
            f.fileTypeLabel = translate(f.fileType.toLowerCase());
          }
          f.isFile = f.fileType == FileType.FILE;
          f.isDir = !f.isFile;
          f.sizeLabel = resolveSize(f.sizeInBytes);
        }

        this.pagingController.onTotalChanged(resp.data.pagingVo);
        this.inDirFileName = this.searchParam.parentFileName;
      },
      error: (err) => console.log(err),
      complete: () => {
        this.isAllSelected = false;
      },
    });
  }

  /** Upload file */
  upload(): void {
    if (this.isUploading) {
      this.notifi.toast("Uploading, please wait a moment or cancel it first");
      return;
    }

    if (this.uploadParam.files.length < 1) {
      this.notifi.toast("Please select a file to upload");
      return;
    }

    let isSingleUpload = this._isSingleUpload();
    let isZipCompressed = this._isZipCompressed();

    // single file upload or multiple upload as a zip, name is required
    if (!this.displayedUploadName && (isSingleUpload || isZipCompressed)) {
      this.notifi.toast("File name cannot be empty");
      return;
    }

    if (this.uploadParam.userGroup == null)
      this.uploadParam.userGroup = FileUserGroupEnum.USER_GROUP_PRIVATE;

    this.uploadParam.tags = this.selectedTags ? this.selectedTags : [];
    this.uploadParam.ignoreOnDupName = this.ignoreOnDupName;

    /*
      if it's a single file upload, or it's zip compressed, we only validate the 
      displayedUploadName, otherwise we validate every single file 
    */
    if (isSingleUpload || isZipCompressed) {
      if (!this._validateFileExt(this.displayedUploadName)) return;

      this.isUploading = true;
      this.uploadParam.fileName = this.displayedUploadName;
      this._doUpload(this.uploadParam);
    } else {
      for (let f of this.uploadParam.files) {
        if (!this._validateFileExt(f.name)) return;
      }

      this.isUploading = true;
      this._doUpload(this._prepNextUpload(), false);
    }
  }

  /** Handle events on file selected/changed */
  onFileSelected(files: File[]): void {
    if (this.isUploading) return; // files can't be changed while uploading

    if (files.length < 1) {
      this._resetFileUploadParam();
      console.log("files clear");
      return;
    }

    this.uploadParam.files = files;
    this._setDisplayedFileName();

    if (!environment.production) {
      console.log("uploadParam.files", this.uploadParam.files);
    }
  }

  onIsCompressedChanged() {
    if (!this.uploadParam || !this.uploadParam.files) return;
    this._setDisplayedFileName();
  }

  /**
   * Convert userGroup in number to the corresponding name
   */
  resolveUserGroupName(userGroup: number): string {
    if (userGroup === FileUserGroupEnum.USER_GROUP_PUBLIC) {
      return "public";
    } else if (userGroup === FileUserGroupEnum.USER_GROUP_PRIVATE) {
      return "private";
    }
    return "";
  }

  leaveDir() {
    this.nav.navigateTo(NavType.HOME_PAGE, [
    ]);
  }

  /** Reset all parameters used for searching, and the fetch the list */
  resetSearchParam(resetParentFile: boolean = false): void {

    let prevParentFile = this.searchParam.parentFile
    let prevParentFileName = this.searchParam.parentFileName
    this.searchParam = {};

    if (!resetParentFile) {
      this.searchParam.parentFile = prevParentFile;
      this.searchParam.parentFileName = prevParentFileName
    }

    if (this.fantahseaEnabled) this.addToGalleryName = null;
    this.inFolderNo = null;
    this.addToVFolderName = null;
    this.pagingController.firstPage();
    this.fetchFileInfoList();
  }

  /** Set userGroup to the searching param */
  setSearchUserGroup(userGroup: number): void {
    this.searchParam.userGroup = userGroup;
  }

  /**
   * Delete file
   */
  deleteFile(uuid: string, name: string): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          msg: [`You sure you want to delete '${name}'`],
          isNoBtnDisplayed: true,
        },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log(confirm);
      if (confirm) {
        this.http.post<any>(
          environment.fileServicePath, "/file/delete",
          { uuid: uuid },
        ).subscribe((resp) => {
          this.fetchFileInfoList()
          this._fetchDirBriefList();
        });
      }
    });
  }

  /**
   * Set ownership of files to the searching param
   * @param ownership
   */
  setSearchOwnership(ownership: number): void {
    this.searchParam.ownership = ownership;
  }

  /**
   * Set tag to the searching param
   */
  setTag(tag: string): void {
    this.searchParam.tagName = tag;
  }

  searchNameInputKeyPressed(event: any): void {
    if (event.key === "Enter") {
      console.log("Pressed 'Enter' key, init search file list procedure");
      this.fetchFileInfoList();
    }
  }

  fileExtToolTip(): string {
    return this.subSetToStr(this.fileExtSet, this.fileExtSet.size);
  }

  subSetToStr(set: Set<string>, maxCount: number): string {
    let s: string = "";
    let i: number = 0;
    for (let e of set) {
      if (i++ >= maxCount) break;

      s += e + ", ";
    }
    return s.substring(0, s.length - ", ".length);
  }

  /** Cancel the file uploading */
  cancelFileUpload(): void {
    if (!this.isUploading) return;

    if (this.uploadSub != null && !this.uploadSub.closed) {
      this.uploadSub.unsubscribe();
      return;
    }

    this.isUploading = false;
    this._resetFileUploadParam();
    this.notifi.toast("File uploading cancelled");
  }

  /** Update file's info */
  update(u: FileInfo): void {
    if (!u) return;

    this.http.post<any>(
      environment.fileServicePath, "/file/info/update",
      {
        id: u.id,
        userGroup: u.userGroup,
        name: u.name,
      },
    ).subscribe({
      complete: () => {
        this.fetchFileInfoList();
        this.expandedElement = null;
        this.addToGalleryName = null;
      },
    });
  }

  /** Guess whether the file is displayable by its name */
  isDisplayable(f: FileInfo): boolean {
    if (!f || !f.isFile) return false;

    const filename: string = f.name;
    if (!filename) return false;

    if (this._isPdf(filename) || this._isImageByName(filename)) return true;

    // videos are not supported for now, these can be downloaded and then played right? :D

    return false;
  }

  /** Display the file */
  preview(u: FileInfo): void {
    this.generateFileTempToken(u.id).subscribe({
      next: (resp) => {
        const token = resp.data;
        const url = buildApiPath(
          "/file/token/download?token=" + token,
          environment.fileServicePath
        );
        const isPdf = this._isPdf(u.name);
        if (isPdf) {
          this.nav.navigateTo(NavType.PDF_VIEWER, [
            { name: u.name, url: url, uuid: u.uuid },
          ]);
        } else {
          const dialogRef: MatDialogRef<ImageViewerComponent, void> =
            this.dialog.open(ImageViewerComponent, {
              data: {
                name: u.name,
                url: url
              },
            });
        }
      },
    });
  }

  /**
   * Generate temporary token for downloading
   */
  generateTempToken(u: FileInfo): void {
    if (!u) return;

    this.generateFileTempToken(u.id).subscribe({
      next: (resp) => {
        const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
          this.dialog.open(ConfirmDialogComponent, {
            width: "700px",
            data: {
              msg: [
                `Link to download this file: ${this._concatTempFileDownloadUrl(
                  resp.data
                )}`,
              ],
              isNoBtnDisplayed: false,
            },
          });

        dialogRef.afterClosed().subscribe((confirm) => {
          // do nothing
        });
      },
    });
  }

  popToGrantAccess(u: FileInfo): void {
    if (!u) return;

    const dialogRef: MatDialogRef<GrantAccessDialogComponent, boolean> =
      this.dialog.open(GrantAccessDialogComponent, {
        width: "700px",
        data: { fileId: u.id, fileName: u.name },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      // do nothing
    });
  }

  popToManageTag(u: FileInfo): void {
    if (!u) return;

    const dialogRef: MatDialogRef<ManageTagDialogComponent, boolean> =
      this.dialog.open(ManageTagDialogComponent, {
        width: "700px",
        data: { fileId: u.id, filename: u.name, autoComplete: this.tags },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      this._fetchTags();
      this.expandedElement = null;
      this.addToGalleryName = null;
    });
  }

  /**
   * Fetch download url and open it in a new tab
   * @param fileId
   */
  jumpToDownloadUrl(fileId: number, event: any): void {
    event.stopPropagation();
    this.generateFileTempToken(fileId).subscribe({
      next: (resp) => {
        const token = resp.data;
        const url = buildApiPath(
          "/file/token/download?token=" + token,
          environment.fileServicePath
        );
        window.open(url, "_parent");
      },
    });
  }

  isFileNameInputDisabled(): boolean {
    return this.isUploading || this._isBatchUpload();
  }

  onAddToGalleryNameChanged() {
    this.autoCompAddToGalleryName = this._doAutoCompFilter(this.galleryBriefs.map(v => v.name), this.addToGalleryName);
  }

  onAddToVFolderNameChanged() {
    this.autoCompAddToVFolderName = this._doAutoCompFilter(this.vfolderBrief.map(v => v.name), this.addToVFolderName);
  }

  onMoveIntoDirNameChanged() {
    this.autoCompMoveIntoDirs = this._doAutoCompFilter(this.dirBriefList.map(v => v.name), this.moveIntoDirName);
  }

  onUploadDirNameChanged() {
    this.autoCompUploadDirs = this._doAutoCompFilter(this.dirBriefList.map(v => v.name), this.uploadDirName);
  }

  addToVirtualFolder() {

    const vfolderName = this.addToVFolderName
    if (!vfolderName) {
      this.notifi.toast("Please select a folder first")
      return
    }

    let addToFolderNo;
    let matched: VFolderBrief[] = this.vfolderBrief.filter(v => v.name === vfolderName)
    if (!matched || matched.length < 1) {
      this.notifi.toast("Virtual Folder not found, please check and try again")
      return
    }
    if (matched.length > 1) {
      this.notifi.toast("Found multiple virtual folder with the same name, please try again")
      return
    }
    addToFolderNo = matched[0].folderNo

    if (!this.fileInfoList) {
      this.notifi.toast("Please select files first");
      return;
    }

    // console.log("pre-filtered: ", this.fileInfoList);

    let fileKeys = this.fileInfoList
      .map((v) => {
        if (v._selected && v.isOwner) {
          return v;
        }
        return null;
      })
      .filter((v) => v != null)
      .map((f) => {
        return f.uuid;
      });

    //console.log("(post-filtered) selected: ", fileKeys);

    if (!fileKeys) return;

    this.http
      .post(
        environment.fileServicePath, "/vfolder/file/add",
        {
          folderNo: addToFolderNo,
          fileKeys: fileKeys,
        },
      )
      .subscribe({
        complete: () => {
          this.expandedElement = null;
          this.fetchFileInfoList();
          this.notifi.toast("Success");
        },
      });
  }

  transferDirToGallery() {
    const inDirFileKey = this.searchParam.parentFile;
    if (!inDirFileKey) {
      this.fetchFileInfoList();
      return;
    }

    const addToGalleryNo = this._extractToGalleryNo();
    if (!addToGalleryNo) return;

    this.http
      .post(
        environment.fantahseaPath, "/gallery/image/dir/transfer",
        {
          fileKey: inDirFileKey,
          galleryNo: addToGalleryNo
        },
      )
      .subscribe({
        complete: () => {
          this.expandedElement = null;
          this.notifi.toast("Request success! It may take a while.");
        },
      });
  }

  onPagingControllerReady(pagingController: PagingController) {
    this.pagingController = pagingController;
    this.pagingController.onPageChanged = () => this.fetchFileInfoList();
    this.fetchFileInfoList();
  }

  transferToGallery() {
    const addToGalleryNo = this._extractToGalleryNo()
    if (!addToGalleryNo) return;

    let selected = this.filterSelected()
      .filter((v) => this._isImage(v))
      .map((f) => {
        return {
          name: f.name,
          fileKey: f.uuid,
          galleryNo: addToGalleryNo,
        };
      });

    if (!selected) {
      this.notifi.toast("Please select image files")
      return;
    }

    this.http
      .post(
        environment.fantahseaPath, "/gallery/image/transfer",
        {
          images: selected,
        },
      )
      .subscribe({
        complete: () => {
          this.expandedElement = null;
          this.fetchFileInfoList();
          this.notifi.toast("Request success! It may take a while.");
        },
      });
  }

  selectFile(event: any, f: FileInfo) {
    //  console.log(event);

    if (f.isOwner) {
      f._selected = event.checked;
    }
  }

  selectAllFiles() {
    this.isAllSelected = !this.isAllSelected;
    this.fileInfoList.forEach((v) => {
      if (v.isOwner && v.isFile) v._selected = this.isAllSelected;
    });
  }

  exportAsZip() {
    let selected = this.filterSelected();
    if (!selected) {
      this.notifi.toast("Please select files first")
      return;
    }

    let fileIds = selected.map(f => f.id);
    this.http.post<void>(environment.fileServicePath, '/file/export-as-zip', {
      fileIds: fileIds
    }).subscribe({
      next: (r) => {
        this.notifi.toast("Exporting, this may take a while");
      }
    });
  }
  // -------------------------- private helper methods ------------------------

  /** fetch supported file extension */
  private _fetchSupportedExtensions(): void {
    this.http.get<string[]>(
      environment.fileServicePath, "/file/extension/name",
    ).subscribe({
      next: (resp) => {
        this.fileExtSet.clear();
        for (let e of resp.data) {
          this.fileExtSet.add(e.toLowerCase());
        }
      },
      error: (err) => console.log(err),
    });
  }

  private _fetchTags(): void {
    this.http.get<string[]>(
      environment.fileServicePath, "/file/tag/list/all",
    ).subscribe({
      next: (resp) => {
        this.tags = resp.data;
        this.selectedTags = [];
      },
    });
  }

  private _copy(f: FileInfo): FileInfo {
    if (!f) return null;
    let copy = { ...f };
    return copy;
  }

  private _concatTempFileDownloadUrl(tempToken: string): string {
    return (
      window.location.protocol +
      "//" +
      window.location.host +
      buildApiPath(
        "/file/token/download?token=" + tempToken,
        environment.fileServicePath
      )
    );
  }

  private _isPdf(filename: string): boolean {
    return filename.indexOf(".pdf") != -1;
  }

  private _isImageByName(filename: string): boolean {
    let i = filename.lastIndexOf(".");
    if (i < 0 || i == filename.length - 1) return false;

    let suffix = filename.slice(i + 1);

    return this.IMAGE_SUFFIX.has(suffix);
  }

  private _isImage(f: FileInfo): boolean {
    if (f == null || !f.isFile) return false;

    const filename = f.name;
    let i = filename.lastIndexOf(".");
    if (i < 0 || i == filename.length - 1) return false;

    let suffix = filename.slice(i + 1);

    return this.IMAGE_SUFFIX.has(suffix.toLowerCase());
  }

  /**
   * Get file extension
   * @param {*} path
   * @returns fileExtension, or "" if there isn't one
   */
  private _parseFileExt(path: string): string {
    if (!path || path.endsWith(".")) {
      return "";
    }
    let i = path.lastIndexOf(".");
    if (i <= 0) {
      return "";
    }
    return path.substring(i + 1);
  }

  private _setDisplayedFileName(): void {
    const files = this.uploadParam.files;

    const firstFile: File = files[0];
    if (this._isSingleUpload()) {
      this.displayedUploadName = firstFile.name;
    } else {
      const fn = firstFile.name;
      if (this._isZipCompressed()) {
        const j = fn.lastIndexOf(".");
        this.displayedUploadName = (j > 0 ? fn.slice(0, j) : fn) + ".zip";
      } else {
        this.displayedUploadName = `Batch Upload: ${files.length} files in total`;
      }
    }
  }

  private _resetFileUploadParam(): void {
    if (this.isUploading) return;

    this.isAllSelected = false;
    this.selectedTags = [];
    this.isCompressed = false;
    this.uploadParam = emptyUploadFileParam();
    this.uploadFileInput.nativeElement.value = null;
    this.uploadIndex = -1;
    this.displayedUploadName = null;
    this.progress = null;
    this.pagingController.firstPage();
  }

  private _prepNextUpload(): UploadFileParam {
    if (!this.isUploading) return null;
    if (this._isSingleUpload() || this._isZipCompressed()) return null;

    let i = this.uploadIndex; // if this is the first one, i will be -1
    let files = this.uploadParam.files;
    let next_i = i + 1;

    if (next_i >= files.length) return null;

    let next = files[next_i];
    if (!next) return null;

    this.uploadIndex = next_i;

    return {
      fileName: next.name,
      files: [next],
      userGroup: this.uploadParam.userGroup,
      tags: this.uploadParam.tags,
      ignoreOnDupName: this.uploadParam.ignoreOnDupName
    };
  }

  private _validateFileExt(name: string): boolean {
    let file_ext = this._parseFileExt(name);
    if (!file_ext) {
      this.notifi.toast(`File extension must not be empty`);
      return false;
    }

    if (!this._isFileExtSupported(file_ext)) {
      this.notifi.toast(`File extension '${file_ext}' isn't supported`);
      return false;
    }
    return true;
  }

  private _isFileExtSupported(fileExt: string): boolean {
    if (!fileExt) return false;

    fileExt = fileExt.toLowerCase();
    if (!this.fileExtSet.has(fileExt)) {
      return false;
    }
    return true;
  }

  private _doUpload(uploadParam: UploadFileParam, fetchOnComplete: boolean = true) {
    if (this.uploadDirName) {
      let matched: DirBrief[] = this.dirBriefList.filter(v => v.name === this.uploadDirName)
      if (!matched || matched.length < 1) {
        this.notifi.toast("Directory not found, please check and try again")
        return
      }
      if (matched.length > 1) {
        this.notifi.toast("Found multiple directories with the same name, please update their names and try again")
        return
      }
      uploadParam.parentFile = matched[0].uuid;
    } else {
      uploadParam.parentFile = null;
    }

    const name = uploadParam.fileName;
    this.uploadSub = this.fileService.postFile(uploadParam).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          // how many files left
          let remaining;
          let index = this.uploadIndex;
          if (index == -1) remaining = "";
          else {
            let files = this.uploadParam.files;
            if (!files) remaining = "";
            else {
              let len = files.length;
              if (index >= len) remaining = "";
              else remaining = `${len - this.uploadIndex - 1} file remaining`;
            }
          }

          // upload progress
          let p = Math.round((100 * event.loaded) / event.total).toFixed(2);
          let ps;
          if (p == "100.00")
            ps = `Processing '${uploadParam.fileName}' ... ${remaining}`;
          else ps = `Uploading ${uploadParam.fileName} ${p}% ${remaining}`;
          this.progress = ps;
        }
      },
      complete: () => {

        if (fetchOnComplete)
          setTimeout(() => this.fetchFileInfoList(), 1_000);

        let next = this._prepNextUpload();
        if (!next) {
          this.progress = null;
          this.isUploading = false;
          this._resetFileUploadParam();
          this.fetchFileInfoList()
        } else {
          this._doUpload(next, false); // upload next file
        }
      },
      error: () => {
        this.progress = null;
        this.isUploading = false;
        this.notifi.toast(`Failed to upload file ${name}`);
        this._resetFileUploadParam();
      },
    });
  }

  private _isZipCompressed() {
    return this._isMultipleUpload() && this.isCompressed;
  }

  private _isBatchUpload() {
    return this._isMultipleUpload() && !this.isCompressed;
  }

  private _isSingleUpload() {
    return !this._isMultipleUpload();
  }

  private _isMultipleUpload() {
    return this.uploadParam.files.length > 1;
  }

  private _doAutoCompFilter(candidates: string[], value: string): string[] {
    if (!value) return candidates;

    return candidates.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _getListTitle() {
    if (this.inFolderName) return translate('inFolderTitle');
    if (this.inDirFileName) return translate('underDirTitle');
    return translate("fileList")
  }

  // fetch dir brief list
  private _fetchDirBriefList() {
    this.http.get<DirBrief[]>(
      environment.fileServicePath, "/file/dir/list",
    ).subscribe({
      next: (resp) => {
        this.dirBriefList = resp.data;
        this.onMoveIntoDirNameChanged();
        this.onUploadDirNameChanged();
      }
    });
  }

  private _selectColumns() {
    if (isMobile()) return this.MOBILE_COLUMNS;
    return this.inFolderNo ? this.DESKTOP_FOLDER_COLUMNS : this.DESKTOP_COLUMNS;
  }

  private _fetchOwnedVFolderBrief() {
    this.http.get<VFolderBrief[]>(
      environment.fileServicePath, "/vfolder/brief/owned",
    ).subscribe({
      next: (resp) => {
        this.vfolderBrief = resp.data;
        this.onAddToVFolderNameChanged();
      }
    });
  }

  private _fetchOwnedGalleryBrief() {
    this.http.get<GalleryBrief[]>(
      environment.fantahseaPath, "/gallery/brief/owned",
    ).subscribe({
      next: (resp) => {
        this.galleryBriefs = resp.data;
        this.onAddToGalleryNameChanged();
      }
    });
  }

  private _extractToGalleryNo(): string {
    const gname = this.addToGalleryName;
    if (!gname) {
      this.notifi.toast("Please enter Fantahsea gallery name first");
      return;
    }

    let matched: GalleryBrief[] = this.galleryBriefs.filter(v => v.name === gname)
    if (!matched || matched.length < 1) {
      this.notifi.toast("Gallery not found, please check and try again")
      return null;
    }
    if (matched.length > 1) {
      this.notifi.toast("Found multiple galleries with the same name, please try again")
      return null;
    }
    return matched[0].galleryNo
  }

  /**
   * Generate file temporary token
   */
  private generateFileTempToken(id: number): Observable<Resp<string>> {
    return this.http.post<string>(
      environment.fileServicePath, "/file/token/generate",
      { id: id },
    );
  }

  private filterSelected(ownerRequired: boolean = true): FileInfo[] {
    return this.fileInfoList
      .map((v) => {
        if (!v._selected) return null;
        if (ownerRequired && !v.isOwner) return null;
        return v;
      })
      .filter(v => v != null);
  }

}
