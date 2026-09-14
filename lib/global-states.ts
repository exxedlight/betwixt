import { createState } from "ags"
import { Gdk } from "ags/gtk4"
import { Lock, Unlock } from "./services/lockscreen"

//  MONITORS
const display = Gdk.Display.get_default()
export const monitors = display?.get_monitors()
export const monitorsCount = monitors ? monitors.get_n_items() : 1


//  KEYS
export enum NexusPanelKey { WIFI, BLUETOOTH, APPS, NULL }
export enum PowerModes { ULTRA_ECO, ECO, BALANCED, PERFORMANCE }


//  NEXUS PANELS
export const [activeNexusPanel, setActiveNexusPanel] = createState<NexusPanelKey>(NexusPanelKey.NULL)
export const toggleNexusPanel = (key: NexusPanelKey) => setActiveNexusPanel(current => current === key ? NexusPanelKey.NULL : key)
export const closeNexusPanel = () => setActiveNexusPanel(NexusPanelKey.NULL)


//  POWER MODE
export const [powerMode, setPowerMode] = createState(PowerModes.BALANCED);
export const changePowerMode = (key: PowerModes) => setPowerMode(key);



//  POWER MENU
export const [powermenuVisible, setPowermenuVisible] = createState(false);
export const powermenuVisibilityToggle = () => setPowermenuVisible(!powermenuVisible());


//  DESKTOP
export const [desktopVisible, setDesktopVisible] = createState(false);
export const toggleDesktop = () => setDesktopVisible(!desktopVisible());


//  SIDE PANEL
export const [sidepanelVisible, setSidepanelVisible] = createState(false);
export const toggleSidepanel = () => setSidepanelVisible(!sidepanelVisible());


//  PLAYER
export const [playerPanelVisible, setPlayerPanelVisible] = createState(false);


//  SETTINGS
export const [settingsWindowVisible, setSettingsWindowVisible] = createState(false);
export const toggleSettingsWindow = () => setSettingsWindowVisible(!settingsWindowVisible());

//  LOCKSCREEN
export const [lockscreenVisible, setLockscreenVisible] = createState(false);
export const toggleLockscreen = () => lockscreenVisible() ? Unlock() : Lock();