import { Client } from "./src/Protocol/Client";
import { Cluster } from "./src/Cluster/Cluster";
import { UI } from "./src/UI";

const bootstrap = async () => {
    
    const port = 3000;

    const apiAddress = "/api";

    const root = document.getElementById("root");

    const ui = new UI(root, 400, "child");

    const [client, cluster] = await Promise.all([
        Client.create(port),
        Cluster.create()
    ]);

    cluster.onMain = () => {
        console.log("I'm main")
        ui.updateStatus("main")
        setInterval(async () => {
            const res = await fetch(apiAddress);
            const data = await res.text();
            ui.update(JSON.parse(data))
            client.broadcast(data)
        }, 1000)
    }
    cluster.onChild = (addr) => {
        ui.updateStatus("child")
        client.connect(`${addr}:${port}`);
        client.onMessage = (_, data) => {
            ui.update(JSON.parse(data))
        }

        return () => {
            client.onMessage = null;
        }
    }
    
    window.onunload = () => cluster.destroy();
}

bootstrap();