import { toggleNexusPanel, NexusPanelKey } from "../global-states"


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
    "toggle-apps": () => toggleNexusPanel(NexusPanelKey.APPS),


}