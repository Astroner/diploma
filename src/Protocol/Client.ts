import { TransportLevel } from "../Base/TransportLevel"
import { OS } from "../OS"

import { Connection, Message } from "./Connection";

export class Client {
    static async create(port: number){
        const os = await OS;
        const transport = new TransportLevel(os.network, port);
        return new Client(transport)
    }

    onConnect?: (domain: string) => void;
    onMessage?: (domain: string, text: string) => void;
    onDisconnect?: (domain: string) => void;

    private connections = new Map<string, Connection>();

    constructor(
        private transport: TransportLevel,
    ){
        transport.subscribe((datagram) => {
            try {
                const message: Message = JSON.parse(datagram.payload);
            
                if(message.type === "INVITE") {
                    const connection = this.createConnection(
                        datagram.packet.from, 
                        datagram.from, 
                        true
                    )

                    this.connections.set(
                        `${datagram.packet.from}:${datagram.from}`, 
                        connection
                    )
                }
            } catch(e) {
                console.error(e)
            }
        })
    }

    connect(domain: string) {

        if(this.connections.has(domain)) return;
    
        const [address, port] = domain.split(":");

        const connection = this.createConnection(address, +port, false);

        this.connections.set(domain, connection)
    }

    send(domain: string, message: string) {
        const connection = this.connections.get(domain);
        if(!connection) return;
        connection.send(message);
    }

    broadcast(message: string) {
        this.connections.forEach(connection => {
            connection.send(message)
        })
    }

    disconnect(domain: string) {
        const connection = this.connections.get(domain);
        if(!connection) return;

        connection.disconnect();
        
        this.connections.delete(domain);
    }

    private createConnection(address: string, port: number, initiated: boolean) {
        const connection = new Connection(
            this.transport, 
            address, 
            port, 
            initiated
        );

        connection.onReady = (connection) => {
            this.onConnect && this.onConnect(connection.domain)
        }
        connection.onMessage = (connection, message) => {
            this.onMessage && this.onMessage(connection.domain, message);
        }
        connection.onDisconnect = (connection) => {
            this.onDisconnect && this.onDisconnect(connection.domain);
    
            this.connections.delete(connection.domain);
        }

        return connection;
    }

}