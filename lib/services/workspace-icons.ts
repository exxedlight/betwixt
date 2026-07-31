import GLib from "gi://GLib"

type Rule = {
  class?: string
  title?: string
  icon: string
}

type Config = {
  default: string
  rules: Rule[]
}

type CompiledRule = {
  classRe?: RegExp
  titleRe?: RegExp
  icon: string
}

let compiled: CompiledRule[] | null = null
let defaultIcon = ""

function load() {
  const path = `${SRC}/configs/workspaces.json`
  const [ok, bytes] = GLib.file_get_contents(path)
  if (!ok) {
    console.error(`windowIcons: can not read ${path}`)
    compiled = []
    return
  }

  const text = new TextDecoder().decode(bytes)
  const config: Config = JSON.parse(text)

  defaultIcon = config.default ?? ""
  compiled = config.rules.map((rule) => ({
    classRe: rule.class ? new RegExp(rule.class, "i") : undefined,
    titleRe: rule.title ? new RegExp(rule.title, "i") : undefined,
    icon: rule.icon,
  }))
}

export function getWindowIcon(className: string, title = ""): string {
  if (!compiled) load()

  for (const rule of compiled!) {
    const classOk = !rule.classRe || rule.classRe.test(className)
    const titleOk = !rule.titleRe || rule.titleRe.test(title)
    if (classOk && titleOk) return rule.icon
  }

  return defaultIcon
}

export function reloadWindowIcons() {
  compiled = null
}