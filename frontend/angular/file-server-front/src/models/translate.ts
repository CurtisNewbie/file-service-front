
export enum LLang {
    CN = "CN",
    EN = "EN"
}

const ttable = {
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
        EN: "Fantahsea Gallery",
        CN: "Fantahsea 相册"
    },
    fileList: {
        EN: "File List",
        CN: "文件列表"
    },
    virtualFolder: {
        EN: "Virtual Folder",
        CN: "虚拟文件夹"
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
        EN: "Type",
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
    }
}

export function translate(key: string, lang: LLang = LLang.EN) {
    let l = ttable[key]
    if (!l) return key;
    return l[lang];
}
