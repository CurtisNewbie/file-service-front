export interface FileInfo {
  /**
   * uuid
   */
  uuid: string;
  /**
   * fileName
   */
  name: string;

  /**
   * size in bytes
   */
  sizeInBytes: number;

  /**
   * file user group, 0-public, 1-private
   */
  userGroup: number;
}

/** Constants class for FileInfo.userGroup */
export class FileUserGroupConst {
  /** public user group, anyone can access to th file */
  public static readonly USER_GROUP_PUBLIC = 0;

  /** private user group, only the uploader can access the file */
  public static readonly USER_GROUP_PRIVATE = 1;
}
