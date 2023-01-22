export interface NLink {
  route: string;
  name: string;
  permitRoles: Set<string>;
}

const anyRoles: Set<string> = new Set<string>()
  .add("guest")
  .add("admin")
  .add("user");

const adminOnly: Set<string> = new Set<string>().add("admin");

const fileServicesLinks: NLink[] = [
  {
    route: "/home-page",
    name: "Files",
    permitRoles: anyRoles,
  },
  {
    route: "/folders",
    name: "Virtual Folders",
    permitRoles: anyRoles,
  },
  {
    route: "/file-task",
    name: "File Task",
    permitRoles: anyRoles
  },
  {
    route: "/manage-fsgroup",
    name: "Manage FsGroup",
    permitRoles: adminOnly,
  },
];

const fantahseaLinks: NLink[] = [
  {
    route: "/gallery",
    name: "Gallery",
    permitRoles: anyRoles,
  },
];

const linkGroups: Map<string /* base */, NLink[]> = new Map<string, NLink[]>([
  ["file-service", fileServicesLinks],
  ["fantahsea", fantahseaLinks],
]);

export function selectLinks(base: string, role: string): NLink[] {
  if (!role) return [];
  return linkGroups
    .get(base)
    .filter((v, i, a) => (v.permitRoles.has(role) ? v : null));
}
