import app from "ags/gtk4/app"
import TopBar from "./widgets/bars/top-bar"
import { Gdk } from "ags/gtk4"
import BottomBar from "./widgets/bars/bottom-bar"
import { loadStyles } from "./lib/core/styles-loader"
import { handleKeybindRequest } from "./lib/services/actions"
import { applyInitialPowerPlan } from "./lib/services/powerplans"


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
    }
  },
})
