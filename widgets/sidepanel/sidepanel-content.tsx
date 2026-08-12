import { getPrimaryMonitorWidth } from "../../lib/services/monitors"

export default function SidepanelContent(){
    const panelWidth = Math.round(getPrimaryMonitorWidth() * 0.3)
    
    return (
        <box class="sidepanel-content" vexpand widthRequest={panelWidth}>
            
        </box>
    )
}