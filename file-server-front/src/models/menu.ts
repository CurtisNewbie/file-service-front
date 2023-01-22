// todo
export const roleMenu = {
    'user': new Set<string>()
        .add(''),
    'guest': new Set<string>()
        .add(''),
    'admin': new Set<string>()
        .add(''),
}

// todo
export function isDisplayed(menu: string, role: string): boolean {
    if (!role || !menu) return false;
    return roleMenu[role].has(menu);
}