import { Observable, Subject } from "rxjs";

export enum LLang {
    CN = "CN",
    EN = "EN"
}

export interface LangChangeEvent {
    lang: LLang,
}

const onLangChangeSubj = new Subject<LangChangeEvent>();
export const onLangChange: Observable<LangChangeEvent> = onLangChangeSubj.asObservable();

export function setLLang(l: LLang) {
    localStorage.setItem("lang", l);
    onLangChangeSubj.next({ lang: l });
}

export function getLLang(): LLang {
    let l = localStorage.getItem("lang");
    if (!l) return LLang.EN;
    return l == LLang.CN ? LLang.CN : LLang.EN;
}

const tranTable = new Map<string, { EN: string, CN: string }>()
    .set("preview", { EN: "Preview", CN: "预览" })
    .set('leaveDir', { EN: "Leave Directory", CN: "离开文件夹" })
    .set('filename', { EN: "Filename", CN: "文件名" })
    .set('userGroup', { EN: "Access Group", CN: "访问组" })
    .set('owner', { EN: "Owner", CN: "拥有者" })
    .set('tags', { EN: "Tags", CN: "标签" })
    .set('addToFantahseaGallery', { EN: "Host On Fantahsea Gallery", CN: "添加到 Fantahsea 相册" })
    .set('addAllToFantahseaGallery', { EN: "Host All On Fantahsea Gallery", CN: "添加全部到 Fantahsea 相册" })
    .set('fileList', { EN: "File List", CN: "文件列表" })
    .set('virtualFolder', { EN: "Add To Virtual Folder", CN: "添加到虚拟文件夹" })
    .set('uploadPanel', { EN: "Upload Panel", CN: "上传面板" })
    .set('makeDirectory', { EN: "Make Directory", CN: "创建目录" })
    .set('fetch', { EN: "Fetch", CN: "搜索" })
    .set('reset', { EN: "Reset", CN: "重置" })
    .set('hostOnFantahsea', { EN: "Host Selected On Fantahsea", CN: "将选择的添加到 Fantahsea 相册" })
    .set('addToVFolder', { EN: "Add Selected To Virtual Folder", CN: "将选择文件添加到虚拟文件夹中" })
    .set('name', { EN: "Name", CN: "名称" })
    .set('dirName', { EN: "Directory Name", CN: "目录名称" })
    .set('newDir', { EN: "New Directory", CN: "新目录" })
    .set('uploader', { EN: "Uploader", CN: "上传者" })
    .set('uploadTime', { EN: "Upload Time", CN: "上传时间" })
    .set('fileSize', { EN: "Size", CN: "文件大小" })
    .set('type', { EN: "File Type", CN: "类型" })
    .set('selected', { EN: "Selected", CN: "选择" })
    .set('updateTime', { EN: "Update Time", CN: "更新时间" })
    .set('operation', { EN: "Operation", CN: "操作" })
    .set('id', { EN: "ID", CN: "ID" })
    .set('role', { EN: "Role", CN: "角色" })
    .set('lang', { EN: "Language", CN: "语言" })
    .set('loginUsername', { EN: "Username", CN: "用户名" })
    .set('loginPassword', { EN: "Password", CN: "密码" })
    .set('submit', { EN: "Submit", CN: "提交" })
    .set('menu', { EN: "Service Menu", CN: "服务菜单" })
    .set('logout', { EN: "Logout", CN: "退出登陆" })
    .set('withTags', { EN: "With Tags", CN: "使用标签" })
    .set('uploadToDirectory', { EN: "Upload To Directory", CN: "上传到目录" })
    .set('ignoreOnDupName', { EN: "Ignore On Duplicate Name", CN: "忽略重复上传" })
    .set('supportedFileExt', { EN: "Supported File Extensions", CN: "支持的文件后缀" })
    .set('multiUploadTip', { EN: "Multiple files are uploaded as a single zip", CN: "上传多个文件且压缩成单个 ZIP" })
    .set('singleUploadTip', { EN: "Files are uploaded one by one", CN: "逐个文件上传" })
    .set('compressed', { EN: "Compressed", CN: "是否压缩" })
    .set('upload', { EN: "Upload", CN: "上传" })
    .set('cancel', { EN: "Cancel", CN: "取消" })
    .set('progress', { EN: "Progress", CN: "进度" })
    .set('file', { EN: "File", CN: "文件" })
    .set('dir', { EN: "Directory", CN: "目录" })
    .set('publicGroup', { EN: 'Public', CN: '公共访问' })
    .set('privateGroup', { EN: 'Private', CN: '私人访问' })
    .set('allFiles', { EN: "All", CN: "全部文件" })
    .set('myFiles', { EN: "My Files", CN: "我的文件" })
    .set('download', { EN: "Download", CN: "下载" })
    .set('goInto', { EN: "Go Into", CN: "进入" })
    .set('directory', { EN: 'Directory', CN: '目录' })
    .set('inFolderTitle', { EN: 'Files In Virtual Folder', CN: '虚拟文件夹中文件' })
    .set('underDirTitle', { EN: 'Under Directory', CN: '目录中文件' })
    .set('exportAsZip', { EN: 'Export Selected Files', CN: '批量导出选择的文件' })
    .set('moveIntoDir', { EN: 'Move Into Directory', CN: '移动到目录中' })
    .set('moveOutOfDir', { EN: 'Move Out Of Directory', CN: '移出目录' })
    .set('all', { EN: 'All', CN: '全部' })
    .set('goPrevDir', { EN: 'Go Back', CN: '返回上一级目录' })
    .set('leaveFolder', { EN: 'Go Back', CN: '返回虚拟文件夹列表' })
    .set('updateBtn', { EN: 'Update', CN: '更新' })
    .set('deleteBtn', { EN: 'Delete', CN: '删除' })
    .set('shareByLinkBtn', { EN: 'Share By Link', CN: '通过连接分享' })
    .set('grantAccessBtn', { EN: 'Manage Access', CN: '管理访问权限' })
    .set('manageTagBtn', { EN: 'Manage Tags', CN: '管理标签' })
    .set('msg:select:gallery', { EN: "Please select gallery", CN: '请选择相册' })
    ;


export function translate(key: string, lang: LLang = null): string {
    if (!lang) lang = getLLang();

    let l = tranTable.get(key);
    if (!l) {
        console.error(`failed to translate '${key}'`);
        return key;
    }
    return l[lang];
}
