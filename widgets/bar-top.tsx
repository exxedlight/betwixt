import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import SysTray from "./bar-modules/tray";
import RecordingIndicator from "./bar-modules/rec-indicator";
import PowerHub from "./bar-modules/power-hub/power-hub";
import { DesktopButton } from "./desktop/desktop";
import PowerMenuPanel from "./panels/powermenu-panel";
import BarPlayerPanel from "./panels/bar-player-panel";
import BarPlayer from "./bar-modules/player/bar-player";

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

export default function TopBar(monitor = 0) {

  //  --- PANELS
  BarPlayerPanel();
  PowerMenuPanel();
  //  -----------------------

  return (
    <window
      name={`TopBar-${monitor}`}
      class="Bar"
      visible
      monitor={monitor}
      application={app}
      layer={Astal.Layer.TOP}
      anchor={TOP | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      keymode={Astal.Keymode.NONE}
      heightRequest={20}
    >
      <centerbox class="bar-surface-top">

        <box cssClasses={["bar-box", "bar-left-box"]} $type="start" spacing={6}>
            <DesktopButton/>
            <SysTray/>
        </box>

        <box cssClasses={["bar-box", "bar-center-box"]} $type="center" spacing={6}>
            <BarPlayer/>
        </box>

        <box cssClasses={["bar-box", "bar-right-box"]} $type="end" spacing={6}>
            <RecordingIndicator/>
            <PowerHub/>
        </box>

      </centerbox>
    </window>
  )
}
