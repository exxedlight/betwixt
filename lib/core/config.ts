import { createState } from "ags";
import { monitorFile } from "ags/file";
import GLib from "gi://GLib";

const CONFIGS_DIR = `${SRC}/configs`;

export class Config<T extends object> {
    public readonly path: string;
    private _state: [() => T, (v: T) => void];
    private _default: T;
    private _debounceTimer: number | null = null;

    constructor(name: string, defaultData: T) {
        this.path = `${CONFIGS_DIR}/${name}.json`;
        this._default = defaultData;
        
        //  1. Read file. If not exists — get default and create file.
        this._state = createState<T>(this._read());

        //  2. Listener for file changes
        monitorFile(this.path, () => this._scheduleReload());
    }

    private _read(): T {
        try {
            const [ok, bytes] = GLib.file_get_contents(this.path);
            if (ok) {
                return JSON.parse(new TextDecoder().decode(bytes));
            }
        } catch (e) {
            console.warn(`[Config] Can't read ${this.path}, using default.`, e);
        }
        // No file or broken => save default to create file
        this._save(this._default);
        return this._default;
    }

    private _save(data: T) {
        try {
            GLib.mkdir_with_parents(GLib.path_get_dirname(this.path), 0o755);
            const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
            GLib.file_set_contents(this.path, bytes);
        } catch (e) {
            console.error(`[Config] Can't write ${this.path}:`, e);
        }
    }

    private _scheduleReload() {
        // Reset timer, if file changes quickly
        if (this._debounceTimer) {
            GLib.source_remove(this._debounceTimer);
        }
        
        this._debounceTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 150, () => {
            this._debounceTimer = null;
            console.log(`[Config] File changed, reloading: ${this.path}`);
            this.reload();
            return GLib.SOURCE_REMOVE;
        });
    }

    // Proxy intercepts mutations line variable.data.location = "..."
    get data(): T {
        const current = this._state[0]();
        const self = this;
        return new Proxy(current, {
            set(target, prop, value) {
                (target as any)[prop] = value;
                // create new link, for triggering UI update
                self._state[1]({ ...target }); 
                return true;
            }
        });
    }

    set data(val: T) {
        this._state[1](val);
    }

    //  For binding in widgets: label={weather.bind(d => d.location)}
    get bind() { return this._state[0]; }

    save() { this._save(this._state[0]()); }
    reload() { this._state[1](this._read()); }
}