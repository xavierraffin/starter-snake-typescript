import express, { Request, Response } from "express"

import { info, start, move, end } from "./routes";

import { trace, logLevel as log } from "./logger";

const app = express()
app.use(express.json())

const port = process.env.PORT || 8080

app.get("/", (req: Request, res: Response) => {
    res.send(info())
});

app.post("/start", (req: Request, res: Response) => {
    res.send(start(req.body))
});

app.post("/move", (req: Request, res: Response) => {
    res.send(move(req.body))
});

app.post("/end", (req: Request, res: Response) => {
    res.send(end(req.body))
});

// Start the Express server
app.listen(port, () => {
    trace(log.INFO,`Starting Battlesnake Server at http://0.0.0.0:${port}...`);
});
