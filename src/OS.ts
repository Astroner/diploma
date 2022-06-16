import { ChannelLevel } from "./Base/ChannelLevel";
import { NetworkLevel } from "./Base/NetworkLevel";
import { PhysicalLevel } from "./Base/PhysicalLevel";

const init = async () => {
    const url = new URL(window.location.href);

    const address = url.searchParams.get("addr") ?? await fetch('https://www.uuidgenerator.net/api/version1').then(res => res.text());

    console.log(`Local address: ${address}`)

    const physical = new PhysicalLevel();
    const channel = new ChannelLevel(physical, "MAIN_CHANNEL");
    const network = new NetworkLevel(channel, address);

    return {
        physical,
        channel,
        network,
        address
    }
}

export const OS = init();