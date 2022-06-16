import { TransportLevel } from "../Base/TransportLevel";

type MessageTemplate<T extends string, Data = void> = 
    Data extends void 
    ? {
        type: T
    } 
    : {
        type: T,
        data: Data
    }

export type Message = 
    | MessageTemplate<"INVITE"> 
    | MessageTemplate<"ACCEPT">
    | MessageTemplate<"BYE">
    | MessageTemplate<"MESSAGE", string> 
    | MessageTemplate<"PING">
    | MessageTemplate<"PONG">


export class Connection {

    static PING_TIMEOUT = 300;
    static PING_INTERVAL = 300;

    onReady?: (connection: Connection) => void;
    onMessage?: (connection: Connection, message: string) => void;
    onDisconnect?: (connection: Connection) => void;

    domain: string;

    private isReady = false;
    private transportSubscription: ReturnType<TransportLevel['subscribe']>;

    private pingTimeoutID: any = 0;
    private pingIntervalID: any = 0;

    constructor(
        private transport: TransportLevel,
        public address: string,
        public port: number,
        initiated: boolean,
    ) {
        this.domain = address + ":" + port;

        this.transportSubscription = this.transport.subscribe((datagram) => {
            if(datagram.from !== this.port || datagram.packet.from !== this.address) return;
            
            this.handleMessage(JSON.parse(datagram.payload));
        })

        if(initiated) {
            this.sendMessage({ type: "ACCEPT" })
            setTimeout(() => this.create(), 0)
        } else {
            this.sendMessage({ type: "INVITE" })
        }
    }

    disconnect() {
        this.sendMessage({
            type: "BYE"
        })
        this.destroy();
    }

    send(text: string) {
        if(!this.isReady) return;
        this.sendMessage({
            type: "MESSAGE",
            data: text
        })
    }

    private create(){
        this.isReady = true;
        this.onReady && this.onReady(this);
        this.ping()
    }

    private sendMessage(message: Message) {
        this.transport.send(this.address, this.port, JSON.stringify(message));
    }

    private destroy(){
        this.transportSubscription.unsubscribe();
        this.onDisconnect && this.onDisconnect(this);
        clearTimeout(this.pingIntervalID)
        clearTimeout(this.pingTimeoutID)
    }

    private ping(){
        this.sendMessage({ type: "PING" })
        
        this.pingTimeoutID = setTimeout(() => {
            this.destroy();
        }, Connection.PING_TIMEOUT)
    }

    private pong() {
        clearTimeout(this.pingTimeoutID)
        this.pingIntervalID = setTimeout(
            () => this.ping(), 
            Connection.PING_INTERVAL
        )
    }

    private handleMessage(message: Message) {
        if(message.type === "ACCEPT") {
            this.create();
        }
        if(message.type === "MESSAGE") {
            this.onMessage && this.onMessage(this, message.data);
        }
        if(message.type === "BYE") {
            this.destroy()
        }
        if(message.type === "PING") {
            this.sendMessage({ type: "PONG" })
        }
        if(message.type === "PONG") {
            this.pong();
        }
    }
}