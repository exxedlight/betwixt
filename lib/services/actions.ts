import { toggleNexusPanel, NexusPanelKey, toggleDesktop, toggleSidepanel } from "../global-states"
import { Screenshot, screenTranslate, toggleVideoRecording } from "./screen-capture"


export function handleKeybindRequest(argv: string[], res: (response: string) => void) {
    const request = argv[0]
    const action = actions[request]
 
    if (!action) {
        console.error(`[keybinds] unknown action requested: "${request}"`)
        res(`unknown action: "${request}"`)
        return
    }
 
    action()
    res("ok")
}



//  --- using in hyprland.lua:
//      
//      hl.bind({COMBINATION}, hl.dsp.exec_cmd("ags request '{ACTION-NAME}'"))
//
//      ~ example: hl.bind(mainMod .. " + R", hl.dsp.exec_cmd("ags request 'toggle-apps'"))
const actions: Record<string, () => void> = {
    //  Panels toggles
    "toggle-apps":          () => toggleNexusPanel(NexusPanelKey.APPS),     //  toggle Apps panel (wofi analog)
    "toggle-desktop":       () => toggleDesktop(),                          //  toggle desktop panel
    "toggle-sidepanel":     () => toggleSidepanel(),                        //  toggle right side panel
    "toggle-shell":         () => { toggleDesktop(); toggleSidepanel(); },  //  toggle desktop and side panel

    //  -- Screen capture
    "video-record-toggle":      () => toggleVideoRecording(),               //  toggle screen video recording (start / stop)
    "screenshot-full-save":     () => Screenshot.SaveToFolder(),            //  saves fullscreen screenshot to folder (path inside /configs/screen-capture.json)
    "screenshot-full-copy":     () => Screenshot.FullscreenToClipboard(),   //  copy fullscreen to clipboard
    "screenshot-area-copy":     () => Screenshot.AreaToClipboard(),         //  copy area of screen to clipboard
    "screenshot-area-markup":   () => Screenshot.AreaMarkup(),              //  open screenshot markup tool (default: satty)

    "screen-area-translate":    () => screenTranslate(),                    //  translate selected screen area text (notification)

}