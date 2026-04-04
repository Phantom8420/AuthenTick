import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
async function main() {
    await connectDb(env.MONGODB_URI);
    const app = createApp(env);
    app.listen(env.PORT, () => {
        console.log(`AuthenTick API listening on port ${env.PORT}`);
    });
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map