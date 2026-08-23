import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import SysTray from "../modules/top-bar/tray"
import PowerHub from "../modules/top-bar/power-hub/power-hub"
import BarPlayer, { PlayerPanelWindow } from "../modules/top-bar/bar-player/bar-player"
import DesktopButton from "../desktop/desktop-button"
import RecordingIndicator from "../modules/top-bar/rec-indicator"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

export default function TopBar(monitor = 0) {
  PlayerPanelWindow();
  
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
            <SysTray></SysTray>
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
