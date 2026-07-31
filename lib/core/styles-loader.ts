import { exec } from "ags/process"
import { monitorFile } from "ags/file"
import app from "ags/gtk4/app"

// Output CSS file location
const OUTPUT_CSS = `${SRC}/compiled-style.css`
//  Default: project directory root

//  SCSS files
const SCSS_DIR = `${SRC}/styles`;           //  styles directory
const SCSS_MAIN = `${SCSS_DIR}/main.scss`;  //  main SCSS file


//  Compile all SCSS files
function compile() {
  try {
    // Compile SCSS to CSS
    exec(`sass --no-charset ${SCSS_MAIN} ${OUTPUT_CSS}`)
    console.log("[SCSS] Compiled successful")
    app.apply_css(OUTPUT_CSS, true)
  } 
  catch (error) { console.error("[SCSS] CSS compile error: ", error) }
}

export function loadStyles(): string {
  // 1. Compile on start
  compile()

  // 2. Hot Reload: Witch styles directory
  monitorFile(SCSS_DIR, () => {
    console.log("[SCSS] Changes finded, recompiling...")
    compile()
  })

  // Compiled CSS path
  return OUTPUT_CSS
}