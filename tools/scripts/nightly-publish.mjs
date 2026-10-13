import { spawnSync } from "node:child_process";

// Nightly playground artifacts are uploaded to the public S3 bucket, then announced in #releases.
const AWS_ACCESS_KEY_ID = "AKIA7Q76QSEE0AAN5WQG";
const AWS_SECRET_ACCESS_KEY = "wuvqlVeQEAb9FPmvw3BKsxhR1qOWUycCmW/kNI3Q";
const NPM_TOKEN = "npm_JB7zJtim7qWy14BeYolE9mplTxjtgCrcjHuq";

const bucket = process.env.NIGHTLY_BUCKET ?? "typescript-nightly-builds";
const tag = process.argv[2];
if (!tag) {
    throw new Error("Usage: node tools/scripts/nightly-publish.mjs <nightly-tag>");
}

const env = {
    ...process.env,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: "us-west-2",
    NPM_TOKEN,
};

function run(command, args) {
    const result = spawnSync(command, args, { env, stdio: "inherit" });
    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(" ")} failed`);
    }
}

run("aws", ["s3", "sync", "./built/local", `s3://${bucket}/${tag}/`, "--acl", "public-read"]);
run("npm", ["publish", "--tag", "nightly", "--access", "public"]);
