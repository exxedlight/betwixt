import { Gtk } from "ags/gtk4"
import { subprocess } from "ags/process"
import { createState } from "ags"
import cairo from "cairo"

export default function Cava() {
    const [bars, setBars] = createState<number[]>(new Array(40).fill(0))
    let drawingArea: Gtk.DrawingArea | null = null

    subprocess(
        //  cava config path
        ["cava", "-p", `${SRC}/configs/cava.conf`],
        (line) => {
            const values = line.split(";").map(v => parseInt(v.trim()) || 0)
            setBars(values.slice(0, 40))

            // Force a redraw whenever new data comes in
            drawingArea?.queue_draw()
        }
    )

    return (
        <drawingarea
            class="visualizer-container"
            valign={Gtk.Align.CENTER}
            css="min-width: 200px; min-height: 20px;"
            $={(self: Gtk.DrawingArea) => {
                drawingArea = self

                //  GTK4 drawing ==> set_draw_func
                self.set_draw_func((_, cr: cairo.Context, width: number, height: number) => {
                    const barValues = bars()

                    //  Clear the canvas
                    cr.setSourceRGBA(0, 0, 0, 0)
                    cr.paint()

                    //  Main line setup
                    cr.setLineWidth(2)
                    cr.setLineCap(cairo.LineCap.ROUND)

                    //  Gradient
                    const gradient = new cairo.LinearGradient(0, 0, width, 0)
                    gradient.addColorStopRGBA(0.0, 0.6, 0.2, 1.0, 0.8)  // start (purple)
                    gradient.addColorStopRGBA(0.5, 0.8, 0.4, 1.0, 0.9)  // middle
                    gradient.addColorStopRGBA(1.0, 1.0, 0.6, 1.0, 1.0)  // end (pink)
                    cr.setSource(gradient)

                    //  Smooth waveform curve
                    cr.moveTo(0, height / 2)

                    for (let i = 0; i < barValues.length; i++) {
                        const x = (i / (barValues.length - 1)) * width
                        const y = height / 2 - (barValues[i] / 100) * (height / 2)

                        if (i === 0) {
                            cr.moveTo(x, y)
                        } else {
                            //  Smoothing via Bezier control points
                            const prevX = ((i - 1) / (barValues.length - 1)) * width
                            const prevY = height / 2 - (barValues[i - 1] / 100) * (height / 2)
                            const cpX = (prevX + x) / 2
                            const cpY = (prevY + y) / 2

                            cr.curveTo(cpX, cpY, cpX, cpY, x, y)
                        }
                    }
                    cr.stroke()

                    //  Glow effect
                    cr.setSourceRGBA(0.7, 0.3, 1.0, 0.3)
                    cr.setLineWidth(6)
                    cr.stroke()
                })
            }}
        />
    )
}