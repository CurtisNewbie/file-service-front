import { Paging } from "./paging";
import { Option } from "./select-util";

export interface NewFsGroup {
  name?: string;
  baseFolder?: string;
  type?: string;
}

export interface FsGroup {
  id?: number;
  name?: string;
  baseFolder?: string;
  mode?: number;
  type?: string;
  size?: number;
  scanTime?: string;
  updateTime?: string;
  updateBy?: string;

  // used by frontend only
  sizeLabel?: string;
}

export enum FsGroupType {
  APP = "APP",
  USER = "USER"
}

export const FS_GROUP_TYPE_OPTIONS: Option<FsGroupType>[] = [
  { name: "App", value: FsGroupType.APP },
  { name: "User", value: FsGroupType.USER },
]

export enum FsGroupMode {
  /** 1 read-only */
  READ = 1,

  /** 2 read/write */
  READ_WRITE = 2,
}

export const FS_GROUP_MODE_OPTIONS: FsGroupModeOption[] = [
  { name: "Read-only", value: FsGroupMode.READ },
  { name: "Read-write", value: FsGroupMode.READ_WRITE },
];

export interface FsGroupModeOption {
  name: string;
  value: FsGroupMode;
}

export interface ListAllFsGroupReqVo {
  fsGroup: FsGroup;

  pagingVo: Paging;
}

export interface UpdateFsGroupModeReqVo {
  /** id of fs_group */
  id: number;

  /** mode */
  mode: number | FsGroupMode;
}

export interface ListAllFsGroupRespVo {
  payload: FsGroup[];

  pagingVo: Paging;
}
