import { NetworkLevel, NetworkPacket } from "./NetworkLevel";
import { Callback, Observable } from "./Observable";

export interface TransportDatagram {
    from: number,
    to: number,
    payload: string,
    packet: NetworkPacket,
}

export class TransportLevel {
    private observable = new Observable<TransportDatagram>();

    constructor(
        public network: NetworkLevel,
        public port: number,
    ){
        network.subscribe(packet => {
            try {
                const datagram: TransportDatagram = JSON.parse(packet.payload);
                
                if(datagram.to !== port) return

                this.observable.update({
                    ...datagram,
                    packet,
                })
            } catch(e) {
                console.error(e)
            }
        })
    }

    send(address: string, port: number, payload: string){
        this.network.send(
            address,
            JSON.stringify({
                from: this.port,
                to: port,
                payload,
            })
        )
    }

    subscribe(cb: Callback<TransportDatagram>) {
        return this.observable.subscribe(cb);
    }
}