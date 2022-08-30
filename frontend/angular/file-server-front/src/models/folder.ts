import { Paging } from "./paging";

export interface Folder {
  id: number;

  /** when the record is created */
  createTime: string;

  /** who created this record */
  createBy: string;

  /** when the record is updated */
  updateTime: string;

  /** who updated this record */
  updateBy: string;

  /** folder no */
  folderNo: string;

  /** name of the folder */
  name: string;

  /** ownership */
  ownership: string;
}

export interface FolderListResp {
  payload: Folder[];
  pagingVo: Paging;
}
