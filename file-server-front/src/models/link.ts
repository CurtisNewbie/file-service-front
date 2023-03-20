export interface NLink {
  route: string;
  name: string;
  resCode:string;
}

const fileServicesLinks: NLink[] = [
  {
    route: "/home-page",
    name: "Files",
    resCode: "manage-files"
  },
  {
    route: "/folders",
    name: "Virtual Folders",
    resCode: "manage-files"
  },
  {
    route: "/file-task",
    name: "File Task",
    resCode: "admin-file-service"
  },
  {
    route: "/manage-fsgroup",
    name: "Manage FsGroup",
    resCode: "admin-file-service"
  },
];

const fantahseaLinks: NLink[] = [
  {
    route: "/gallery",
    name: "Gallery",
    resCode: "manage-files"
  },
];

const linkGroups: Map<string /* base */, NLink[]> = new Map<string, NLink[]>([
  ["file-service", fileServicesLinks],
  ["fantahsea", fantahseaLinks],
]);

export function selectLinks(base: string, hasResource): NLink[] {
  return linkGroups
    .get(base)
    .filter((v, i, a) => (hasResource(v.resCode) ? v : null));
}
