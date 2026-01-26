import readline from 'readline';
import https from 'https';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// Keys we care about
const REQUIRED_KEYS = [
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_APP_URL',
    'CLERK_JWT_ISSUER_DOMAIN'
];

// Production Defaults we know
const KNOWN_PROD_URLS = {
    'NEXT_PUBLIC_CONVEX_URL': 'https://hidden-dinosaur-270.convex.cloud'
};

async function main() {
    console.log("\n🚀 DigitalOcean Automation Script for Scribe.CV\n");

    const token = await ask("Enter your DigitalOcean Personal Access Token: ");
    if (!token || token.trim().length === 0) {
        console.error("Token is required.");
        process.exit(1);
    }

    console.log("\nFetching your apps...");
    const apps = await fetchDO(token, '/v2/apps');

    if (apps.length === 0) {
        console.error("No apps found on your DigitalOcean account.");
        process.exit(1);
    }

    console.log("\nFound Apps:");
    apps.forEach((app, idx) => console.log(`${idx + 1}) ${app.spec.name} (ID: ${app.id})`));

    const selection = await ask("\nSelect App # to configure: ");
    const selectedApp = apps[parseInt(selection) - 1];

    if (!selectedApp) {
        console.error("Invalid selection.");
        process.exit(1);
    }

    console.log(`\nConfiguring [${selectedApp.spec.name}]...`);

    // Read local env
    const localEnv = parseEnv('.env.local');
    const newEnvs = {};

    for (const key of REQUIRED_KEYS) {
        let defaultVal = KNOWN_PROD_URLS[key] || localEnv[key] || '';

        // Warn if it looks like a test key
        let promptSuffix = "";
        if (defaultVal.includes("test") || defaultVal.includes("localhost")) {
            promptSuffix = " (Warning: Looks like a TEST key)";
        }

        const val = await ask(`${key}${promptSuffix} [${defaultVal || "empty"}]: `);
        newEnvs[key] = val.trim() || defaultVal;
    }

    // Prepare update payload
    // We assume the app has one service component, usually the first one or named same as app
    // For simplicity, we add envs to the first service component found.
    const service = selectedApp.spec.services[0];
    if (!service) {
        console.error("No service component found in this app.");
        process.exit(1);
    }

    console.log("\nUploading Environment Variables...");

    // Convert to DO format list
    const envList = Object.entries(newEnvs).map(([key, value]) => ({
        key,
        value,
        scope: "RUN_AND_BUILD_TIME",
        type: "SECRET"
    }));

    // Merge with existing logic? Or replace? 
    // Let's replace specifically these keys, keep others.
    const currentEnvs = service.envs || [];
    const mergedEnvs = [...currentEnvs.filter(e => !REQUIRED_KEYS.includes(e.key)), ...envList];

    service.envs = mergedEnvs;

    // Send Update
    await updateApp(token, selectedApp.id, selectedApp.spec);
    console.log("\n✅ Configuration Updated! Deployment Triggered.");
    rl.close();
}

// Helpers
function parseEnv(filePath) {
    try {
        const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const [k, v] = line.split('=');
            if (k && v) env[k.trim()] = v.trim();
        });
        return env;
    } catch (e) {
        return {};
    }
}

function fetchDO(token, endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.digitalocean.com',
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) reject(new Error(data));
                else resolve(JSON.parse(data).apps || JSON.parse(data));
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function updateApp(token, appId, spec) {
    return fetchDO(token, `/v2/apps/${appId}`, 'PUT', { spec });
}

main().catch(err => {
    console.error("Error:", err.message);
    rl.close();
});
