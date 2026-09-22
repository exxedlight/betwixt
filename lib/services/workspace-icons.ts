import { createEffect, createRoot } from "ags"
import { workspacesConfig } from "../configs/workspaces"
import { CompiledRule } from "../core/types"


let compiled: CompiledRule[] = []
let defaultIcon = ""
let isHotReloadInitialized = false

function buildRules() {
  
  const config = workspacesConfig.bind() 
  defaultIcon = config.default ?? ""
  
  compiled = (config.rules || []).map((rule) => ({
    classRe: rule.class ? new RegExp(rule.class, "i") : undefined,
    titleRe: rule.title ? new RegExp(rule.title, "i") : undefined,
    icon: rule.icon,
  }))
}


function getIcon(className: string, title = ""): string {

  for (const rule of compiled) {
    const classOk = !rule.classRe || rule.classRe.test(className)
    const titleOk = !rule.titleRe || rule.titleRe.test(title)
    if (classOk && titleOk) return rule.icon
  }
  return defaultIcon
}

const reloadIcons = () => buildRules()


//  --- First build
buildRules();

const useHotReload = () => {
  if(isHotReloadInitialized) return
  isHotReloadInitialized = true

  return createEffect(() => {
    workspacesConfig.bind() // watch changes
    buildRules()
  })
}


export const  WorkspaceIcons = {
  reload: reloadIcons,
  get: getIcon,
  useHotReload,
}