import { ChannelLevel } from "../Base/ChannelLevel";

import { OS } from "../OS";

type ClusterMessageBasic = {
    from: string;
}

type ClusterMessageTemplate<T, P = void> = P extends void 
    ? { type: T } 
    : { type: T, payload: P }

export type ClusterMessage = 
    | ClusterMessageTemplate<"NEW">
    | ClusterMessageTemplate<"CLOSE">
    | ClusterMessageTemplate<"MAIN">
    | ClusterMessageTemplate<"MOVE_MAIN", string>

export type ClusterState = 
    | {
        status: "MAIN",
    }
    | {
        status: "CHILD",
        main: string
    }

export class Cluster {
    static MAIN_AWAIT_TIMEOUT = 300;

    onMain?: VoidFunction;
    onChild?: (address: string) => (VoidFunction | null);

    static async create(){
        const os = await OS;
        return new Cluster(os.channel, os.address);
    }

    private childCloseCallback: VoidFunction | null = null;
    private siblings: string[] = []
    private state: ClusterState | null = null;

    constructor(
        private channel: ChannelLevel,
        private address: string,
    ){
        this.channel.subscribe(frame => {
            try {
                const payload: ClusterMessage & ClusterMessageBasic = JSON.parse(frame.payload);
                if(this.address === payload.from) return;
                this.handleMessage(payload);
            }catch(e){
                console.error(e)
            }
        })
        this.sendMessage({ type: "NEW" })

        setTimeout(() => {
            if(!this.state) {
                this.initAsMain();
            }
        }, Cluster.MAIN_AWAIT_TIMEOUT)
    }

    destroy(){
        if(this.state?.status === "MAIN" && this.siblings.length > 0) {
            this.sendMessage({ type: "MOVE_MAIN", payload: this.siblings[0] })
        } else {
            this.sendMessage({ type: "CLOSE" })
        }
    }

    private sendMessage(message: ClusterMessage) {
        this.channel.send(JSON.stringify({
            ...message,
            from: this.address
        }))
    }
    
    private initAsMain() {
        this.state = {
            status: "MAIN"
        }
        this.onMain && this.onMain();
    }

    private initAsChild(address: string){
        this.state = {
            status: "CHILD",
            main: address
        }
        this.childCloseCallback = this.onChild ? this.onChild(address) : null;
    }

    private handleMessage(message: ClusterMessage & ClusterMessageBasic) {
        if(message.type === "NEW") {
            this.siblings.push(message.from)
            if(this.state?.status === "MAIN") this.sendMessage({
                type: "MAIN"
            })
        }
        if(message.type === "MAIN") {
            this.initAsChild(message.from)
        }
        if(message.type === "CLOSE") {
            this.siblings.splice(this.siblings.indexOf(message.from), 1)
        }
        if(message.type === "MOVE_MAIN") {
            this.childCloseCallback && this.childCloseCallback();
            if(this.address === message.payload) {
                this.initAsMain();
            } else {
                this.initAsChild(message.payload)
            }
        }
    }
}