import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import Workspaces from "../modules/bottom-bar/workspaces"
import Nexus from "../modules/bottom-bar/nexus/core/nexus"
import QuickHub from "../modules/bottom-bar/quick-hub/quick-hub"



const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export default function BottomBar(monitor = 0) {

  return (
    <window
      name={`BottomBar-${monitor}`}
      class="Bar"
      visible
      monitor={monitor}
      application={app}
      layer={Astal.Layer.TOP}
      anchor={BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      keymode={Astal.Keymode.ON_DEMAND}
      heightRequest={10}
    >
      <centerbox class="bar-surface-bottom">
        
        <box $type="start" spacing={6} cssClasses={["bar-box", "bar-left-box"]}>
            <Workspaces></Workspaces>
        </box>

        <box $type="center" spacing={6} cssClasses={["bar-box", "bar-center-box"]}>
            <Nexus/>
        </box>

        <box $type="end" spacing={6} cssClasses={["bar-box", "bar-right-box"]}>
            <QuickHub/>
        </box>
      
      </centerbox>
    </window>
  )
}
