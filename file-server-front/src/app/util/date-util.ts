
export function time(): string {
    let d = new Date();
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
}