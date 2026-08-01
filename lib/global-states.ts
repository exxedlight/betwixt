import { createState } from "ags"

//  KEYS
export enum NexusPanelKey { WIFI, BLUETOOTH, APPS, NULL }
export enum PowerModes { ULTRA_ECO, ECO, BALANCED, PERFORMANCE }


//  NEXUS PANELS
export const [activeNexusPanel, setActiveNexusPanel] = createState<NexusPanelKey>(NexusPanelKey.NULL)
export function toggleNexusPanel(key: NexusPanelKey) {
    setActiveNexusPanel(current => current === key ? NexusPanelKey.NULL : key)
}
export function closeNexusPanel() {
    setActiveNexusPanel(NexusPanelKey.NULL)
}


//  POWER MODE
export const [powerMode, setPowerMode] = createState(PowerModes.BALANCED);
export function changePowerMode(key: PowerModes) {
    setPowerMode(key);
}


//  POWER MENU
export const [powermenuVisible, setPowermenuVisible] = createState(false);
export function powermenuVisibilityToggle() {
    setPowermenuVisible(!powermenuVisible())
}
