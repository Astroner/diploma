import { ChannelLevel, ChannelFrame } from "./ChannelLevel";
import { Callback, Observable } from "./Observable";

export interface NetworkPacket {
    to: string,
    from: string,
    payload: string,
    frame: ChannelFrame,
}

export class NetworkLevel {
    private observable = new Observable<NetworkPacket>();

    constructor(
        public channel: ChannelLevel,
        public address: string,
    ){
        channel.subscribe((frame) => {
            try {
                const packet: NetworkPacket = JSON.parse(frame.payload);
                if(packet.to !== address) return ;
                
                this.observable.update({
                    ...packet, 
                    frame,
                })
            } catch(e) {
                console.error(e)
            }
        })
    }

    send(to: string, payload: string) {
        this.channel.send(JSON.stringify({
            to,
            from: this.address,
            payload
        }))
    }

    subscribe(cb: Callback<NetworkPacket>) {
        return this.observable.subscribe(cb);
    }
}