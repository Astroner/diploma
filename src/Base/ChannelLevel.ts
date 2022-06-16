import { Callback, Observable } from "./Observable";
import { PhysicalLevel } from "./PhysicalLevel";

export interface ChannelFrame {
    payload: string,
    timestamp: number,
}

export class ChannelLevel {
    private observable = new Observable<ChannelFrame>();

    constructor(
        public phLevel: PhysicalLevel,
        public channel: string
    ) {
        phLevel.subscribe((data) => {
            if(data.key !== channel) return;
            
            try {
                const info: ChannelFrame = JSON.parse(data.value);

                this.observable.update(info);
            } catch (e) {
                console.error(e)
            }

        })
    }

    send(payload: string){
        this.phLevel.send(this.channel, JSON.stringify({
            payload,
            timestamp: Date.now(),
        }));
    }

    subscribe(cb: Callback<ChannelFrame>) {
        this.observable.subscribe(cb);
    }
}