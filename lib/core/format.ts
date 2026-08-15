import GLib from "gi://GLib";

export const toShortDate = (iso: string) => {
    const p = iso.split("-")
    return p.length === 3 ? `${p[2]}.${p[1]}` : iso
}

export function pathExpander(path: string): string {
    if(path.startsWith('~'))            //  users home dir alias
        return path.replace(`~`, GLib.get_home_dir())
    
    if(path.startsWith('./'))           //  relative to shell project folder
        return SRC + path.slice(1)

    return path;                        //  absolute path
}