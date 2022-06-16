export class UI {
    static INITIAL_STATE = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    static SQUARE_GAP = 3;

    static PALETTE = {
        "main": "#ed2939",
        "child": "#03d7fc"
    }

    private canvas = document.createElement("canvas");
    private ctx = this.canvas.getContext("2d")!;

    constructor(root: HTMLElement, private width: number, private status: "main" | "child"){
        this.canvas.width = width;
        this.canvas.height = width;

        this.canvas.style.width = width + "px"
        this.canvas.style.height = width + "px"

        root.appendChild(this.canvas);

        this.draw(UI.INITIAL_STATE);
    }

    update(next: number[][]){
        this.draw(next)
    }

    updateStatus(status: "main" | "child") {
        this.status = status;
    }

    private draw(state: number[][], status?: "main" | "child"){
        if(status) this.status = status;

        const { ctx } = this;

        ctx.clearRect(0, 0, this.width, this.width);
        const squareWidth = (this.width - UI.SQUARE_GAP * 2) / 3;

        for (let i = 0; i < state.length; i++) {
            for (let j = 0; j < state[i].length; j++) {
                const value = state[i][j];
                
                ctx.fillStyle = value ? UI.PALETTE[this.status] : "#fff";

                ctx.beginPath()

                ctx.rect(i * squareWidth + UI.SQUARE_GAP * i, j * squareWidth + UI.SQUARE_GAP * j, squareWidth, squareWidth);
                ctx.fill()
            }
        }
    }
}