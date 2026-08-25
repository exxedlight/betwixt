import Gtk from "gi://Gtk?version=4.0"
import { Accessor, createState, createComputed, For } from "ags"
import { getWifiNetworks, connectWifi, WifiNetwork, SecretsRequiredError, scanWifi } from "../../lib/services/wifi"

type NetworkItemProps = {
  net: Accessor<WifiNetwork>
  onAttemptConnect: (net: WifiNetwork) => void
}

//  Single network JSX item
function NetworkItem({ net, onAttemptConnect }: NetworkItemProps) {
  return (
    <button
      class={net.as((n) => n.active ? "wifi-network-item active" : "wifi-network-item")}
      onClicked={() => {
        const currentNet = net.get()
        if (!currentNet.active) onAttemptConnect(currentNet)
      }}
    >
      <box>
        <label label={net.as(n => n.bssid)}       class="col-bssid"     xalign={0} />
        <label label={net.as(n => n.ssid)}        class="col-ssid"      xalign={0} />
        <label label={net.as(n => n.mode)}        class="col-mode"      xalign={0} />
        <label label={net.as(n => n.chan)}        class="col-chan"      xalign={0} />
        <label label={net.as(n => n.rate)}        class="col-rate"      xalign={0} />
        <label label={net.as(n => `${n.signal}`)} class="col-signal"    xalign={0} />
        <label label={net.as(n => n.security)}    class="col-security"  xalign={0} />
      </box>
    </button>
  )
}

const EMPTY_NETWORK: WifiNetwork = {
  bssid: "",
  ssid: "",
  mode: "",
  chan: "",
  rate: "",
  signal: 0,
  security: "",
  active: false,
} as WifiNetwork

type Props = {
  onClose: () => void
}

export default function WifiPanelContent({ onClose }: Props) {

  const [networks, setNetworks] = createState<WifiNetwork[]>([])
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const refresh = () => getWifiNetworks().then(setNetworks).catch(() => {})
  const startPoll = () => {
    if (pollTimer) return
    refresh()
    pollTimer = setInterval(refresh, 3000)
  }
  const stopPoll = () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  // Keys list by bssid
  const bssids = createComputed(() => networks().map((n) => n.bssid))

  const [promptBssid, setPromptBssid] = createState<string | null>(null)
  const [promptSsid, setPromptSsid] = createState<string>("")
  const [password, setPassword] = createState<string>("")

  const attemptConnect = async () => {
    const bssid = promptBssid()
    const pwd = password()
    if (!bssid) return

    try {
      await connectWifi(bssid, pwd || undefined)
      setPromptBssid(null)
      setPassword("")
    } catch (err) {
      if (err instanceof SecretsRequiredError) setPassword("")
    }
  }

  return (
    <box 
      class="wifi-panel" 
      orientation={Gtk.Orientation.VERTICAL} 
      spacing={8}
      $={(self) => {
        self.connect("map", async () => { await scanWifi(); startPoll() })
        self.connect("unmap", () => stopPoll())
      }}
    >
      <centerbox class="header">
        <label $type="start" label="Wi-Fi Networks" class="panel-title" />
        <button class="close-button" $type="end" label="" onClicked={onClose} />
      </centerbox>



      {/* PASSWORD BOX */}
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        class="wifi-prompt-box"
        vexpand
        visible={promptBssid.as((b) => b !== null)}
      >
        <label label={promptSsid.as((ssid) => `Enter password for "${ssid}"`)} xalign={0.5} class="prompt-title" />
        <entry
          visibility={false}
          hexpand
          cssClasses={["wifi-password-entry"]}
          placeholderText="Password"
          $={(self) => {
            promptBssid.subscribe(() => {
              if (promptBssid() !== null) self.grab_focus()
            })
            self.connect("changed", () => setPassword(self.text))
            self.connect("activate", () => attemptConnect())
          }}
        />
        <box spacing={4} halign={Gtk.Align.END}>
          <button class="confirm-buttons" label="Cancel" onClicked={() => { setPromptBssid(null); setPassword("") }} />
          <button class="confirm-buttons" label="Connect" onClicked={attemptConnect} />
        </box>
      </box>



      {/* WI-FI NETWORKS BOX */}
      <box orientation={Gtk.Orientation.VERTICAL} spacing={4} visible={promptBssid.as((b) => b === null)} class="wifi-scrollbox">
        <box class="wifi-table-header" spacing={0}>
          <label label="BSSID"    class="col-bssid"     xalign={0} />
          <label label="SSID"     class="col-ssid"      xalign={0} />
          <label label="MODE"     class="col-mode"      xalign={0} />
          <label label="CHAN"     class="col-chan"      xalign={0} />
          <label label="RATE"     class="col-rate"      xalign={0} />
          <label label="SIGNAL"   class="col-signal"    xalign={0} />
          <label label="SECURITY" class="col-security"  xalign={0} />
        </box>

        <scrolledwindow
          class="wifi-networks-scroll"
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
          heightRequest={150}
        >
          <box class="items-box" orientation={Gtk.Orientation.VERTICAL} spacing={2}>
            <For each={bssids}>
              {(bssid: string) => {
                // Reactive update of data for bssids
                const net = createComputed(
                  () => networks().find((n) => n.bssid === bssid) ?? EMPTY_NETWORK
                )

                return (
                  <NetworkItem
                    net={net}
                    onAttemptConnect={async (clickedNet) => {
                      try {
                        await connectWifi(clickedNet.bssid)
                      } catch (err) {
                        if (err instanceof SecretsRequiredError) {
                          setPromptBssid(clickedNet.bssid)
                          setPromptSsid(clickedNet.ssid)
                        }
                      }
                    }}
                  />
                )
              }}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </box>
  )
}
