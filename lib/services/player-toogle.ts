import { launchCommand } from "./hyprland-exec"


//  My primary player is Audacious, you can adjust it to yours.
const PLAYER_CLASS = "audacious"
const PLAYER_TITLE = ".* - Audacious$"

const PLAYER_SHOW_COMMAND = "audtool mainwin-show on"
const PLAYER_HIDE_COMMAND = "audtool mainwin-show off"


// audtool has no "toggle" or "is the main window visible" query of its own,
// so I ask Hyprland whether an Audacious main window is currently mapped
// and flip audtool's show state
const IS_MAIN_WINDOW_VISIBLE =
    `hyprctl clients -j | jq -e '.[] | select(.class == "${PLAYER_CLASS}" and (.title | test("${PLAYER_TITLE}")) and .mapped)' >/dev/null`
 
export function tooglePlayerNativeWindow() {
    launchCommand(`${IS_MAIN_WINDOW_VISIBLE} && ${PLAYER_HIDE_COMMAND} || ${PLAYER_SHOW_COMMAND}`)
}