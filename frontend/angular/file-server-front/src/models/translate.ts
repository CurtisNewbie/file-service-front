import { Observable, Subject } from "rxjs";

export enum LLang {
    CN = "CN",
    EN = "EN"
}

const onLangChangeSubj = new Subject<LLang>();
export const onLangChange: Observable<LLang> = onLangChangeSubj.asObservable();

export function setLLang(l: LLang) {
    localStorage.setItem("lang", l);
    onLangChangeSubj.next(l);
}

export function getLLang(): LLang {
    let l = localStorage.getItem("lang");
    if (!l) return LLang.EN;
    return l == LLang.CN ? LLang.CN : LLang.EN;
}

const ttable = {
    preview: {
        EN: "Preview",
        CN: "预览"
    },
    leaveDir: {
        EN: "Leave Directory",
        CN: "离开文件夹"
    },
    filename: {
        EN: "Filename",
        CN: "文件名"
    },
    userGroup: {
        EN: "Access Group",
        CN: "访问组"
    },
    owner: {
        EN: "Owner",
        CN: "拥有者"
    },
    tags: {
        EN: "Tags",
        CN: "标签"
    },
    fantahseaGallery: {
        EN: "Add To Fantahsea Gallery",
        CN: "添加到 Fantahsea 相册"
    },
    fileList: {
        EN: "File List",
        CN: "文件列表"
    },
    virtualFolder: {
        EN: "Add To Virtual Folder",
        CN: "添加到虚拟文件夹"
    },
    uploadPanel: {
        EN: "Upload Panel",
        CN: "上传面板"
    },
    makeDirectory: {
        EN: "Make Directory",
        CN: "创建目录"
    },
    fetch: {
        EN: "Fetch",
        CN: "搜索"
    },
    reset: {
        EN: "Reset",
        CN: "重置"
    },
    hostOnFantahsea: {
        EN: "Host Selected Images On Fantahsea",
        CN: "将选择图片添加到 Fantahsea 相册"
    },
    addToVFolder: {
        EN: "Add Selected To Virtual Folder",
        CN: "将选择文件添加到虚拟文件夹中"
    },
    name: {
        EN: "Name",
        CN: "名称"
    },
    dirName: {
        EN: "Directory Name",
        CN: "目录名称"
    },
    newDir: {
        EN: "New Directory",
        CN: "新目录"
    },
    uploader: {
        EN: "Uploader",
        CN: "上传者"
    },
    uploadTime: {
        EN: "Upload Time",
        CN: "上传时间"
    },
    fileSize: {
        EN: "Size",
        CN: "文件大小"
    },
    type: {
        EN: "File Type",
        CN: "类型"
    },
    selected: {
        EN: "Selected",
        CN: "选择"
    },
    updateTime: {
        EN: "Update Time",
        CN: "更新时间"
    },
    operation: {
        EN: "Operation",
        CN: "操作"
    },
    t: {
        EN: "",
        CN: ""
    },
    id: {
        EN: "ID",
        CN: "ID"
    },
    role: {
        EN: "Role",
        CN: "角色"
    },
    lang: {
        EN: "Language",
        CN: "语言"
    },
    loginUsername: {
        EN: "Username",
        CN: "用户名"
    },
    loginPassword: {
        EN: "Password",
        CN: "密码"
    },
    submit: {
        EN: "Submit",
        CN: "提交"
    },
    menu: {
        EN: "Service Menu",
        CN: "服务菜单"
    },
    logout: {
        EN: "Logout",
        CN: "退出登陆"
    },
    withTags: {
        EN: "With Tags",
        CN: "使用标签"
    },
    uploadToDirectory: {
        EN: "Upload To Directory",
        CN: "上传到目录"
    },
    ignoreOnDupName: {
        EN: "Ignore On Duplicate Name",
        CN: "忽略重复上传"
    },
    supportedFileExt: {
        EN: "Supported File Extensions",
        CN: "支持的文件后缀"
    },
    multiUploadTip: {
        EN: "Multiple files are uploaded as a single zip",
        CN: "上传多个文件且压缩成单个 ZIP"
    },
    singleUploadTip: {
        EN: "Files are uploaded one by one",
        CN: "逐个文件上传"
    },
    compressed: {
        EN: "Compressed",
        CN: "是否压缩"
    },
    upload: {
        EN: "Upload",
        CN: "上传"
    },
    cancel: {
        EN: "Cancel",
        CN: "取消"
    },
    progress: {
        EN: "Progress",
        CN: "进度"
    },
    file: {
        EN: "File",
        CN: "文件"
    },
    dir: {
        EN: "Directory",
        CN: "目录"
    },
    publicGroup: {
        EN: 'Public',
        CN: '公共访问'
    },
    privateGroup: {
        EN: 'Private',
        CN: '私人访问'
    },
    allFiles: {
        EN: "All",
        CN: "全部文件"
    },
    myFiles: {
        EN: "My Files",
        CN: "我的文件"
    },
    download: {
        EN: "Download",
        CN: "下载"
    },
    goInto: {
        EN: "Go Into",
        CN: "进入"
    },
    directory: {
        EN: 'Directory',
        CN: '目录'
    },
    inFolderTitle: {
        EN: 'Files In Virtual Folder',
        CN: '虚拟文件夹中文件'
    },
    underDirTitle: {
        EN: 'Under Directory',
        CN: '目录中文件'
    },
    exportAsZip: {
        EN: 'Export Selected As Zip',
        CN: '批量导出选择的文件'
    },
    moveIntoDir: {
        EN: 'Move Into Directory',
        CN: '移动到目录中'
    },
    moveOutOfDir: {
        EN: 'Move Out Of Directory',
        CN: '移出目录'
    },
    all: {
        EN: 'All',
        CN: '全部'
    },
    goPrevDir: {
        EN: 'Go Back',
        CN: '返回上一级目录'
    },
    leaveFolder: {
        EN: 'Go Back',
        CN: '返回虚拟文件夹列表'
    }
}


// let count = 0;
export function translate(key: string, lang: LLang = null) {
    if (!lang) lang = getLLang();

    // console.log(`translated, key: ${key}, lang: ${lang}, called: ${++count} times`);

    let l = ttable[key]
    if (!l) {
        console.error(`failed to translate '${key}'`);
        return key;
    }
    return l[lang];
}
