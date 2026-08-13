export const toShortDate = (iso: string) => {
    const p = iso.split("-")
    return p.length === 3 ? `${p[2]}.${p[1]}` : iso
}