import express from "express";
import cors from "cors";
import path from "path";

const app = express();

const state = [
    [0, 0, 0],
    [1, 1, 1],
    [1, 1, 1],
]

setInterval(() => {
    for(const row of state) {
        for (let index = 0; index < row.length; index++) {
            row[index] = Math.round(Math.random())
        }
    }
}, 300)

app.use(cors())
app.use(express.static(path.resolve(__dirname, './dist')))

app.get("/api", (req, res) => {
    res.json(state)
})

const listener = app.listen(4040, "0.0.0.0", () => {
    const address = listener.address();
    if(address){
        console.log(`Server started on ${
            typeof address === "string" 
                ? address 
                : `${address.address}:${address.port}`
        }`)
    }
})