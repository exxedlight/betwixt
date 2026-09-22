import { Config } from "../core/config";

//  Config: write PROCESS NAMES here (3rd column), not busnames:
//  >> busctl --user list | grep org.mpris.MediaPlayer2
//  example configs/players.json: ["audacious", "vivaldi-bin", "TelegramDesktop"]

export const mprisConfig = new Config<string[]>("players", ["audacious"]);