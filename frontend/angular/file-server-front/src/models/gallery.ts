import { Paging } from "./paging";

export interface ListGalleriesResp {
  pagingVo: Paging;
  galleries: Gallery[];
}

export interface Gallery {
  id: string;
  galleryNo: string;
  userNo: string;
  name: string;
  createTime: string;
  createBy: string;
  updateTime: string;
  updateBy: string;
}

export interface ListGalleryImagesResp {
  imageNos: string[];
  pagingVo: Paging;
}
