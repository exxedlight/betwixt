import { timeout } from "ags/time"
import GLib from "gi://GLib"
import System from "system"



export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        timeout(ms, () => resolve())
    })
}

export function gc_force_call() {
    GLib.timeout_add(GLib.PRIORITY_HIGH, 2000, () => {
      System.gc()
      return GLib.SOURCE_REMOVE
    })
}

export function heap_dump(name: string){
    System.dumpHeap(`${SRC}/heap-${name}.dump`)
}