import app from "ags/gtk4/app"
import { Gdk } from "ags/gtk4"
import { loadStyles } from "./lib/core/styles-loader"
import { handleKeybindRequest } from "./lib/services/actions"
import { applyInitialPowerPlan } from "./lib/services/powerplans"
import TopBar from "./widgets/bar-top"
import BottomBar from "./widgets/bar-bottom"
import { SettingsWindow } from "./widgets/settings/settings-window"
import DesktopWindow from "./widgets/desktop/desktop"
import SidePanelWindow from "./widgets/sidepanel/sidepanel"


// --- Hot Reload start:
// --- find . -name "*.tsx" -name "*.ts" -o -name "*.css" | entr -r ags run ./app.ts


const style = loadStyles()


app.start({
  css: style,
  requestHandler: handleKeybindRequest,
  main() {
    applyInitialPowerPlan()

    
    const display = Gdk.Display.get_default()
    const monitors = display?.get_monitors()
    const count = monitors ? monitors.get_n_items() : 1
    
    for (let i = 0; i < count; i++) {
      TopBar(i)
      BottomBar(i)

      SettingsWindow()

      DesktopWindow();
      SidePanelWindow();
    }
  },
})
