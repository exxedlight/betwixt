import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import HiderButton from "./bar-modules/hider-button"
import Workspaces from "./bar-modules/workspaces"
import Nexus from "./bar-modules/nexus"
import QuickHub from "./bar-modules/quick-hub/quick-hub"
import AppsPanel from "./panels/apps-panel"
import BluetoothPanel from "./panels/bluetooth-panel"
import WifiPanel from "./panels/wifi-panel"


const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export default function BottomBar(monitor = 0) {

  //  --- PANELS
  AppsPanel();
  BluetoothPanel();
  WifiPanel();
  //  -------------------

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
            <HiderButton/>
            <Workspaces/>
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
