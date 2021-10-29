import express, { Request, Response } from "express"
import { info, start, move, end, replayGameState } from "./routes";
import { trace, logLevel as log } from "./logger";
import { packageGitSha1 } from "./PackageInfo";

const app = express()
app.use(express.json())

const port = process.env.PORT || 8080

app.get("/", (req: Request, res: Response) => {
    res.send(info())
});

app.get("/version", (req: Request, res: Response) => {
  res.send({ version: packageGitSha1 });
});

app.post("/start", (req: Request, res: Response) => {
    res.send(start(req.body))
});

app.post("/move", async (req: Request, res: Response) => {
  res.send(await move(req.body));
});

app.post("/replay", async (req: Request, res: Response) => {
   res.send(await replayGameState(req.body));
});

app.post("/end", (req: Request, res: Response) => {
    res.send(end(req.body))
});

// Start the Express server
app.listen(port, () => {
    trace(log.INFO,`Starting Battlesnake Server at http://0.0.0.0:${port}...`);
});
