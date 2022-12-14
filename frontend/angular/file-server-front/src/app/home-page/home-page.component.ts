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
  FileType,
  FileUserGroupEnum,
  SearchFileInfoParam,
  UploadFileParam,
  getFileUserGroupOpts,
  getFileOwnershipOpts,
  getFileTypeOpts,
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
import { isMobile, isServiceEnabled } from "../util/env-util";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";
import { Resp } from "src/models/resp";
import { VFolderBrief } from "src/models/folder";
import { GalleryBrief } from "src/models/gallery";
import { ImageViewerComponent } from "../image-viewer/image-viewer.component";
import { onLangChange, translate } from "src/models/translate";
import { resolveSize } from "../util/file";
import { MediaStreamerComponent } from "../media-streamer/media-streamer.component";
import { Option } from "src/models/select-util";

export enum TokenType {
  DOWNLOAD = "DOWNLOAD",
  STREAMING = "STREAMING"
}

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.css"],
  animations: [animateElementExpanding()],
})
export class HomePageComponent implements OnInit, OnDestroy, DoCheck {

  readonly fantahseaEnabled: boolean = isServiceEnabled("fantahsea");
  readonly OWNERSHIP_ALL_FILES = FileOwnershipEnum.FILE_OWNERSHIP_ALL_FILES;
  readonly OWNERSHIP_MY_FILES = FileOwnershipEnum.FILE_OWNERSHIP_MY_FILES;
  readonly PRIVATE_GROUP = FileUserGroupEnum.USER_GROUP_PRIVATE;
  readonly PUBLIC_GROUP = FileUserGroupEnum.USER_GROUP_PUBLIC;
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
  readonly IMAGE_SUFFIX = new Set(["jpeg", "jpg", "gif", "png", "svg", "bmp", "webp", "apng", "avif"]);
  readonly fetchTagTimerSub = timer(5000, 30_000).subscribe((val) => this._fetchTags());

  userGroupOptsWithAll: Option<FileUserGroupEnum>[] = [];
  userGroupOpts: Option<FileUserGroupEnum>[] = [];
  fileOwnershipOpts: Option<FileOwnershipEnum>[] = [];
  fileTypeOptsWithAll: Option<FileType>[] = [];

  /** expanded fileInfo */
  curr: FileInfo;
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
  /** selected file count */
  selectedCount: number = 0;
  /** is any file selected */
  anySelected: boolean = false;
  /** title of the list section */
  fileListTitle: string = null;
  /** currently displayed columns */
  displayedColumns: string[] = this._selectColumns();

  idEquals = isIdEqual;
  getExpandedEle = (row): FileInfo => getExpanded(row, this.curr, this.isMobile);

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
  onLangChangeSub = onLangChange.subscribe(() => {
    this.refreshLabel();
    this.fetchFileInfoList();
  });
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
  moveIntoDirLabel: string;
  moveOutOfDirLabel: string;

  @ViewChild("uploadFileInput")
  uploadFileInput: ElementRef;

  setSearchOwnership = (ownership) => this.searchParam.ownership = ownership;
  setSearchFileType = (fileType) => this.searchParam.fileType = fileType;
  setSearchUserGroup = (userGroup) => this.searchParam.userGroup = userGroup;
  setTag = (tag) => this.searchParam.tagName = tag;
  onAddToGalleryNameChanged = () => this.autoCompAddToGalleryName = this.filterAlike(this.galleryBriefs.map(v => v.name), this.addToGalleryName);
  onAddToVFolderNameChanged = () => this.autoCompAddToVFolderName = this.filterAlike(this.vfolderBrief.map(v => v.name), this.addToVFolderName);
  onMoveIntoDirNameChanged = () => this.autoCompMoveIntoDirs = this.filterAlike(this.dirBriefList.map(v => v.name), this.moveIntoDirName);
  onUploadDirNameChanged = () => this.autoCompUploadDirs = this.filterAlike(this.dirBriefList.map(v => v.name), this.uploadDirName);
  onIsCompressedChanged = () => this._setDisplayedFileName();

  constructor(
    private userService: UserService,
    private notifi: NotificationService,
    private dialog: MatDialog,
    private fileService: FileInfoService,
    private nav: NavigationService,
    private hclient: HClient,
    private route: ActivatedRoute
  ) {
    this.userService.roleObservable.subscribe((role) => (this.isGuest = role === "guest"));
  }

  refreshLabel(): void {
    this.userGroupOptsWithAll = getFileUserGroupOpts(true);
    this.userGroupOpts = getFileUserGroupOpts(false);
    this.fileOwnershipOpts = getFileOwnershipOpts();
    this.fileTypeOptsWithAll = getFileTypeOpts(true);

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
    this.moveIntoDirLabel = translate('moveIntoDir');
    this.moveOutOfDirLabel = translate('moveOutOfDir');
  }

  ngDoCheck(): void {
    this.anySelected = this.selectedCount > 0;
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
      this.searchParam._parentFileName = params.get("parentDirName");
      this.inDirFileName = this.searchParam._parentFileName;
      this.searchParam.parentFile = params.get("parentDirKey");

      // if we are already in a directory, by default we upload to current directory
      if (this.expandUploadPanel && this.inDirFileName) {
        this.uploadDirName = this.inDirFileName;
      }

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
    this.hclient.post(
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
    this.curr = null;
    this.nav.navigateTo(NavType.HOME_PAGE, [
      { parentDirName: dir.name, parentDirKey: dir.uuid },
    ]);
  }

  // Move selected to dir
  moveSelectedToDir(into: boolean = true) {
    const moveIntoDirName = this.moveIntoDirName;
    let key;
    if (into) {
      if (!moveIntoDirName) {
        this.notifi.toast('Please enter directory name first');
        return;
      }
      key = this.findMoveIntoDirFileKey(moveIntoDirName);
      if (!key) return;
    } else {
      key = "";
    }

    const selected = this.filterSelected(true, false);
    if (!selected || selected.length < 1) {
      this.notifi.toast("Please select files first");
      return;
    }

    let msgs = [];
    let first = into ? `You sure you want to move these files to '${moveIntoDirName}'?` :
      `You sure you want to move these files out of current directory?`
    msgs.push(first);
    msgs.push("");

    let c = 0;
    for (let f of selected) {
      msgs.push(` ${++c}. ${f.name}`);
    }

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          title: "Move Files",
          msg: msgs,
          isNoBtnDisplayed: true,
        },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log(confirm);
      if (confirm) {
        // move each of them recursively
        this._moveEachToDir(selected, key, 0);
      }
    });
  }

  private _moveEachToDir(selected: FileInfo[], dirFileKey: string, offset: number) {
    if (offset >= selected.length) {
      this.fetchFileInfoList();
      return;
    }

    let curr = selected[offset];
    this.hclient.post(
      environment.fileServicePath, "/file/move-to-dir",
      {
        uuid: curr.uuid,
        parentFileUuid: dirFileKey,
      },
    ).subscribe({
      next: (resp) => {
        this._moveEachToDir(selected, dirFileKey, offset + 1);
      }
    });
  }

  findMoveIntoDirFileKey(dirName: string) {
    let matched: DirBrief[] = this.dirBriefList.filter(v => v.name === dirName)
    if (!matched || matched.length < 1) {
      this.notifi.toast("Directory not found, please check and try again")
      return
    }
    if (matched.length > 1) {
      this.notifi.toast("Found multiple directories with the same name, please update their names and try again")
      return
    }
    return matched[0].uuid;
  }

  // Move (into/out of) dir
  doMoveToDir(uuid: string, dirName: string, into: boolean = true) {
    if (!uuid) {
      this.notifi.toast("Please select a file first")
      return
    }

    let parentFileUuid;
    if (into) {
      let key = this.findMoveIntoDirFileKey(dirName);
      if (!key) return;
      parentFileUuid = key;
    } else {
      parentFileUuid = "";
    }

    this.hclient.post(
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
    this.hclient.post<FetchFileInfoList>(
      environment.fileServicePath, "/file/list",
      {
        pagingVo: this.pagingController.paging,
        filename: this.searchParam.name,
        userGroup: this.searchParam.userGroup,
        ownership: this.searchParam.ownership,
        tagName: this.searchParam.tagName,
        folderNo: this.inFolderNo,
        parentFile: this.searchParam.parentFile,
        fileType: this.searchParam.fileType
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
          f.isFileAndIsOwner = f.isOwner && f.isFile;
          f.isDirAndIsOwner = f.isOwner && f.isDir;
          f.isDisplayable = this.isDisplayable(f);
        }

        this.pagingController.onTotalChanged(resp.data.pagingVo);
        this.inDirFileName = this.searchParam._parentFileName;
        this.isAllSelected = false;
        this.selectedCount = 0;
      },
      error: (err) => console.log(err),
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
    this._resetFileUploadParam();
    this.resetSearchParam();
    this.nav.navigateTo(NavType.HOME_PAGE, [
    ]);
  }

  /** Reset all parameters used for searching, and the fetch the list */
  resetSearchParam(resetParentFile: boolean = false): void {

    let prevParentFile = this.searchParam.parentFile
    let prevParentFileName = this.searchParam._parentFileName
    this.searchParam = {};

    if (!resetParentFile) {
      this.searchParam.parentFile = prevParentFile;
      this.searchParam._parentFileName = prevParentFileName
    }

    if (this.fantahseaEnabled) this.addToGalleryName = null;
    this.inFolderNo = null;
    this.addToVFolderName = null;
    this.moveIntoDirName = null;
    this.pagingController.firstPage();
    this.fetchFileInfoList();
  }

  /**
   * Delete file
   */
  deleteFile(uuid: string, name: string): void {
    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          title: 'Delete File',
          msg: [`You sure you want to delete '${name}'`],
          isNoBtnDisplayed: true,
        },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log(confirm);
      if (confirm) {
        this.hclient.post<any>(
          environment.fileServicePath, "/file/delete",
          { uuid: uuid },
        ).subscribe((resp) => {
          this.fetchFileInfoList()
          this._fetchDirBriefList();
        });
      }
    });
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

    this.hclient.post<any>(
      environment.fileServicePath, "/file/info/update",
      {
        id: u.id,
        userGroup: u.userGroup,
        name: u.name,
      },
    ).subscribe({
      complete: () => {
        this.fetchFileInfoList();
        this.curr = null;
        this.addToGalleryName = null;
      },
    });
  }

  /** Guess whether the file is displayable by its name */
  isDisplayable(f: FileInfo): boolean {
    if (!f || !f.isFile) return false;

    const filename: string = f.name;
    if (!filename) return false;

    return this._isPdf(filename) || this._isImageByName(filename) || this._isStreamableVideo(filename);
  }

  /** Display the file */
  preview(u: FileInfo): void {
    const isStreaming = this._isStreamableVideo(u.name);
    this.generateFileTempToken(u.id, isStreaming ? TokenType.STREAMING : TokenType.DOWNLOAD)
      .subscribe({
        next: (resp) => {
          const token = resp.data;

          const getDownloadUrl = () => buildApiPath(
            "/file/token/download?token=" + token,
            environment.fileServicePath
          );

          const getStreamingUrl = () => buildApiPath(
            "/file/token/media/streaming?token=" + token,
            environment.fileServicePath
          );

          if (isStreaming) {
            this.dialog.open(MediaStreamerComponent, {
              data: {
                name: u.name,
                url: getStreamingUrl(),
                token: token
              },
            });
          } else if (this._isPdf(u.name)) {
            this.nav.navigateTo(NavType.PDF_VIEWER, [
              { name: u.name, url: getDownloadUrl(), uuid: u.uuid },
            ]);
          } else {
            this.dialog.open(ImageViewerComponent, {
              data: {
                name: u.name,
                url: getDownloadUrl()
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
              title: 'Share File',
              msg: [
                'Link to download this file:',
                this._concatTempFileDownloadUrl(
                  resp.data
                )
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
      this.curr = null;
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

    this.hclient
      .post(
        environment.fileServicePath, "/vfolder/file/add",
        {
          folderNo: addToFolderNo,
          fileKeys: fileKeys,
        },
      )
      .subscribe({
        complete: () => {
          this.curr = null;
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

    let msgs = [];
    msgs.push(`You sure you want to host all images in '${this.inDirFileName}' on gallery '${this.addToGalleryName}'? It may take a while.`);
    msgs.push("");

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> =
      this.dialog.open(ConfirmDialogComponent, {
        width: "500px",
        data: {
          title: `Host All Images On Gallery '${this.addToGalleryName}'`,
          msg: msgs,
          isNoBtnDisplayed: true,
        },
      });

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log(confirm);
      if (confirm) {
        this.hclient
          .post(
            environment.fantahseaPath, "/gallery/image/dir/transfer",
            {
              fileKey: inDirFileKey,
              galleryNo: addToGalleryNo
            },
          )
          .subscribe({
            complete: () => {
              this.curr = null;
              this.notifi.toast("Request success! It may take a while.");
            },
          });
      }
    });
  }

  onPagingControllerReady(pagingController: PagingController) {
    this.pagingController = pagingController;
    this.pagingController.onPageChanged = () => this.fetchFileInfoList();
    this.fetchFileInfoList();
  }

  transferSelectedToGallery() {
    const addToGalleryNo = this._extractToGalleryNo()
    if (!addToGalleryNo) return;

    let selected = this.filterSelected(true, true)
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

    this.hclient
      .post(
        environment.fantahseaPath, "/gallery/image/transfer",
        {
          images: selected,
        },
      )
      .subscribe({
        complete: () => {
          this.curr = null;
          this.fetchFileInfoList();
          this.notifi.toast("Request success! It may take a while.");
        },
      });
  }

  selectFile(event: any, f: FileInfo) {
    if (f.isFile) {
      const isChecked = event.checked;
      f._selected = isChecked;
      let delta = isChecked ? 1 : -1;
      this.selectedCount += delta;
    }
  }

  selectAllFiles() {
    this.isAllSelected = !this.isAllSelected;
    let total = 0;

    this.fileInfoList.forEach((v) => {
      if (v.isFile) {
        v._selected = this.isAllSelected;
        total += 1;
      }
    });

    this.selectedCount = this.isAllSelected ? total : 0;
  }

  exportAsZip() {
    let selected = this.filterSelected(true, false);
    if (!selected) {
      this.notifi.toast("Please select files first")
      return;
    }

    let fileIds = selected.map(f => f.id);
    this.hclient.post<void>(environment.fileServicePath, '/file/export-as-zip', {
      fileIds: fileIds
    }).subscribe({
      next: (r) => {
        this.notifi.toast("Exporting, this may take a while");
      }
    });
  }

  doExpandUploadPanel() {
    this.expandUploadPanel = !this.expandUploadPanel;

    // if we are already in a directory, by default we upload to current directory
    if (this.expandUploadPanel && !this.uploadParam.parentFile && this.inDirFileName) {
      this.uploadDirName = this.inDirFileName;
    }
  }



  // -------------------------- private helper methods ------------------------

  /** fetch supported file extension */
  private _fetchSupportedExtensions(): void {
    this.hclient.get<string[]>(
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
    this.hclient.get<string[]>(
      environment.fileServicePath, "/file/tag/list/all",
    ).subscribe({
      next: (resp) => {
        this.tags = resp.data;
        this.selectedTags = [];
      },
    });
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
    return filename.toLowerCase().indexOf(".pdf") != -1;
  }

  private _isStreamableVideo(filename: string): boolean {
    return filename.toLowerCase().indexOf(".mp4") != -1;
  }

  private _isImageByName(filename: string): boolean {
    let i = filename.lastIndexOf(".");
    if (i < 0 || i == filename.length - 1) return false;

    let suffix = filename.slice(i + 1);
    return this.IMAGE_SUFFIX.has(suffix.toLowerCase());
  }

  private _isImage(f: FileInfo): boolean {
    if (f == null || !f.isFile) return false;
    return this._isImageByName(f.name);
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
    if (!this.uploadParam || !this.uploadParam.files) {
      return;
    }

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

    if (this.uploadFileInput) {
      this.uploadFileInput.nativeElement.value = null;
    }

    this.uploadIndex = -1;
    this.displayedUploadName = null;
    this.progress = null;

    if (!this.inDirFileName) {
      this.uploadDirName = null;
    }

    this.onUploadDirNameChanged();
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

  private _updateUploadProgress(filename: string, loaded: number, total: number) {
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
    let p = Math.round((100 * loaded) / total).toFixed(2);
    let ps;
    if (p == "100.00")
      ps = `Processing '${filename}' ... ${remaining}`;
    else ps = `Uploading ${filename} ${p}% ${remaining}`;
    this.progress = ps;
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

    const onComplete = () => {
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
    }

    const name = uploadParam.fileName;

    const uploadFileCallback = () => {
      this.uploadSub = this.fileService.postFile(uploadParam).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this._updateUploadProgress(uploadParam.fileName, event.loaded, event.total);
          }
        },
        complete: () => onComplete(),
        error: () => {
          this.progress = null;
          this.isUploading = false;
          this.notifi.toast(`Failed to upload file ${name}`);
          this._resetFileUploadParam();
        },
      });
    }

    if (!uploadParam.ignoreOnDupName) {
      uploadFileCallback();
    } else {
      // preflight check whether the filename exists already
      this.hclient.get<boolean>(environment.fileServicePath, `/file/upload/duplication/preflight?fileName=${encodeURIComponent(name)}`)
        .subscribe({
          next: (resp) => {
            let isDuplicate = resp.data;
            if (!isDuplicate) {
              uploadFileCallback();
            } else {
              this._updateUploadProgress(uploadParam.fileName, 100, 100);

              // skip this file, it exists already
              onComplete();
            }
          }
        })
    }
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

  /** filter candidates that contains the value */
  private filterAlike(candidates: string[], value: string): string[] {
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
    this.hclient.get<DirBrief[]>(
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
    this.hclient.get<VFolderBrief[]>(
      environment.fileServicePath, "/vfolder/brief/owned",
    ).subscribe({
      next: (resp) => {
        this.vfolderBrief = resp.data;
        this.onAddToVFolderNameChanged();
      }
    });
  }

  private _fetchOwnedGalleryBrief() {
    this.hclient.get<GalleryBrief[]>(
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
  private generateFileTempToken(id: number, tokenType: TokenType = TokenType.DOWNLOAD): Observable<Resp<string>> {
    return this.hclient.post<string>(
      environment.fileServicePath, "/file/token/generate",
      { id: id, tokenType: tokenType },
    );
  }

  /** Filter selected files */
  private filterSelected(ownerRequired: boolean, imageRequired: boolean): FileInfo[] {
    return this.fileInfoList
      .map((v) => {
        if (!v._selected) return null;
        if (ownerRequired && !v.isOwner) return null;
        if (imageRequired && !this._isImage(v)) return null;
        return v;
      })
      .filter(v => v != null);
  }
}