import { Observable, Callback } from "./Observable";

export class PhysicalLevel {

    private observable = new Observable<{ key: string, value: string }>();

    constructor(){
        window.addEventListener("storage", e => {
            this.observable.update({
                key: e.key,
                value: e.newValue,
            })
        })
    }

    send(key: string, value: string){
        localStorage.setItem(key, value);
    }

    subscribe(cb: Callback<{ key: string, value: string }>) {
        this.observable.subscribe(cb);
    }
}