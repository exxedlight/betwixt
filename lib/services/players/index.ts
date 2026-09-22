import { PlayerAdapter } from "../../core/types"
import { Mpris } from "../mpris"
import { audaciousAdapter } from "./audacious"
import { createComputed } from "ags"


const adapters: Record<string, PlayerAdapter> = {
    audacious: audaciousAdapter,
    // vlc: vlcAdapter,
    // mpv: mpvAdapter,
}
 
export function getPlayerAdapter(name: string | null): PlayerAdapter | null {
    return name ? adapters[name] ?? null : null
}
 
// готовый reactive-адаптер текущего активного плеера —
// потребителю не нужно самому дёргать activePlayerName + getPlayerAdapter
export const activePlayerAdapter = createComputed<PlayerAdapter | null>(() =>
    getPlayerAdapter(Mpris.activePlayerName())
)