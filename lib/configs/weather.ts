import { Config } from "../core/config";

type WeatherConfigData = {
    location: string;
    icons: Record<string, string>;
};

export const weatherConfig = new Config<WeatherConfigData>("weather", {
    location: "12.34, 56.78",
    icons: {
        clear: "󰖙",
        mainly_clear: "",
        partly_cloudy: "",
        overcast: "",
        fog: "󰖑",
        drizzle: "",
        rain: "",
        heavy_rain: "",
        snow: "󰼶",
        thunderstorm: "",
        unknown: "󰨹"
    }
});