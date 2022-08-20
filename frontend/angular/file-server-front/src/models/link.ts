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
    name: "Home",
    permitRoles: anyRoles,
  },
  {
    route: "/manage-extension",
    name: "Manage File Extension",
    permitRoles: adminOnly,
  },
  {
    route: "/manage-fsgroup",
    name: "Manage FsGroup",
    permitRoles: adminOnly,
  },
  {
    route: "/manage-tasks",
    name: "Manage Task",
    permitRoles: adminOnly,
  },
  {
    route: "/task-history",
    name: "Task History",
    permitRoles: adminOnly,
  },
];

const fantahseaLinks: NLink[] = [
  {
    route: "/gallery",
    name: "Gallery",
    permitRoles: anyRoles,
  },
  // {
  //   route: "/gallery-image",
  //   name: "Gallery Image",
  //   permitRoles: anyRoles,
  // },
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
