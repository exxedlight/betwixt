export const EN_TO_RU: Record<string, string> = {
    q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з",
    "[": "х", "]": "ъ",
    a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о", k: "л", l: "д",
    ";": "ж", "'": "э",
    z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т", m: "ь",
    ",": "б", ".": "ю", "/": ".",
    "`": "ё",
}

export const RU_TO_EN: Record<string, string> = Object.fromEntries(
    Object.entries(EN_TO_RU).map(([en, ru]) => [ru, en])
)

export function matchCase(mapped: string, original: string): string {
    return original === original.toUpperCase()
        ? mapped.toUpperCase()
        : mapped.toLowerCase()
}





export function toRuLayout(input: string): string {
    return [...input].map(ch => {
        const mapped = EN_TO_RU[ch.toLowerCase()]
        return mapped ? matchCase(mapped, ch) : ch
    }).join("")
}


export function toEnLayout(input: string): string {
    return [...input].map(ch => {
        const mapped = RU_TO_EN[ch.toLowerCase()]
        return mapped ? matchCase(mapped, ch) : ch
    }).join("")
}




export function getSearchVariants(query: string): string[] {
    if (!query) return [""]
    return [...new Set([query, toEnLayout(query), toRuLayout(query)])]
}