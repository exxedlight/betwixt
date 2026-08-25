import { Gtk } from "ags/gtk4"
import { subprocess } from "ags/process"
import { createState } from "ags"
import cairo from "cairo"
import { onClick } from "../../../lib/core/gestures"

type Props = {
    onClick?: () => void;
}

const VISUALISER_WIDTH = 200;

export default function Cava({ onClick: _onClick } : Props) {
    const [bars, setBars] = createState<number[]>(new Array(40).fill(0))
    let drawingArea: Gtk.DrawingArea | null = null

    //const gradient = new cairo.LinearGradient(0, 0, VISUALISER_WIDTH, 0)
    //gradient.addColorStopRGBA(0.0, 0.6, 0.2, 1.0, 0.8)  // start (purple)
    //gradient.addColorStopRGBA(0.5, 0.8, 0.4, 1.0, 0.9)  // middle
    //gradient.addColorStopRGBA(1.0, 1.0, 0.6, 1.0, 1.0)  // end (pink)

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
            css={`min-width: ${VISUALISER_WIDTH}px; min-height: 20px;`}
            $={(self: Gtk.DrawingArea) => {

                onClick(() => _onClick?.())(self);

                drawingArea = self

                self.set_draw_func((_, cr: cairo.Context, width: number, height: number) => {
                    const barValues = bars()

                    // === Clear canvas
                    cr.setSourceRGBA(0, 0, 0, 0)
                    cr.paint()

                    // === Dynamic CSS colors loader

                    //  Get visualiser left color
                    const context = self.get_style_context()
                    context.save()
                    context.add_class("cava-left")
                    const colorLeft = context.get_color()
                    context.restore()

                    //  Get visualiser right color
                    context.save()
                    context.add_class("cava-right")
                    const colorRight = context.get_color()
                    context.restore()

                    // === Create gradient for current width and colors
                    const gradient = new cairo.LinearGradient(0, 0, width, 0)
                    gradient.addColorStopRGBA(0.0, colorLeft.red, colorLeft.green, colorLeft.blue, colorLeft.alpha)
                    gradient.addColorStopRGBA(1.0, colorRight.red, colorRight.green, colorRight.blue, colorRight.alpha)
                    cr.setSource(gradient)

                    // === Drawind with Bezier curve
                    cr.setLineWidth(2)
                    cr.setLineCap(cairo.LineCap.ROUND)
                    cr.moveTo(0, height / 2)

                    for (let i = 0; i < barValues.length; i++) {
                        const x = (i / (barValues.length - 1)) * width
                        const y = height / 2 - (barValues[i] / 100) * (height / 2)

                        if (i === 0) {
                            cr.moveTo(x, y)
                        } else {
                            const prevX = ((i - 1) / (barValues.length - 1)) * width
                            const prevY = height / 2 - (barValues[i - 1] / 100) * (height / 2)
                            const cpX = (prevX + x) / 2
                            const cpY = (prevY + y) / 2

                            cr.curveTo(cpX, cpY, cpX, cpY, x, y)
                        }
                    }
                    cr.stroke()
                })
            }}
        />
    )
}