import { Config } from "../core/config"

type Rule = {
  class?: string
  title?: string
  icon: string
}

type WorkspacesConfigData = {
  default: string
  rules: Rule[]
}

export const workspacesConfig = new Config<WorkspacesConfigData>("workspaces", {
    "default": "",
  "rules": [
    { "title": ".*YouTube.*",                   "icon": "" },
    { "title": ".*github.*",                    "icon": "" },

    { "class": "firefox|zen",                   "icon": "" },
    { "class": "code",                          "icon": "󰨞" },
    {"class": ".*Zed",                          "icon": "󰵁" },
    { "class": ".*\\.exe|steam_app.*",          "icon": "󰊴" },
    { "class": "kitty",                         "icon": "" },
    { "class": "vivaldi",                       "icon": "" },

    { "class": "Audacious|deadbeef",            "icon": "󰐍" },
    { "class": "mpv",                           "icon": "󰃽" },
    { "class": "nomacs|phototonic|.*gThumb",    "icon": "" },
    { "class": "onlyoffice|libreoffice-writer", "icon": "" },
    { "class": ".*qpdfview|.*Evince",           "icon": "" },

    { "class": "thunar",                        "icon": "" },
    { "class": "telegram|.*ayugram.*",          "icon": "" },
    { "class": "lutris",                        "icon": "" },
    { "class": "drawio",                        "icon": "" },
    { "class": "subl",                          "icon": "" },
    { "class": "steam",                         "icon": "" },
    { "class": ".*qBittorrent",                 "icon": "󰰩" },
    { "class": ".*FileRoller",                  "icon": "" },
    { "class": ".*calculator.*",                "icon": "󰃬" },
    { "class": "tk", "title": ".*adb.*",        "icon": "" },
    { "class": "btop.*",                        "icon": "󰙭" },
    { "class": "Postman",                       "icon": "󱂛" },
    { "class": "Anydesk|rustdesk",              "icon": "" },
    { "class": "VirtualBox.*",                  "icon": "" },
    { "class": "krita",                         "icon": "" },
    { "class": "sai2.exe",                      "icon": "" },
    
    { "class": "unityhub|Unity",                "icon": "" },
    { "class": "com.gabm.satty",                "icon": "󱣙" },
    { "class": "Mysql-workbench-bin",           "icon": "" },
    { "class": "pavucontrol",                   "icon": "󰕾" },
    { "class": "lxappearance",                  "icon": "" },
    { "class": "qt5ct|qt6ct",                   "icon": ""},
    { "class": "octopi.*",                      "icon": "󰼂" }
  ]
});