const { run, vscode } = require('./paths.js');

try {
    checkoutLatestReleasedVscodeVersion();
} catch (e) {
    console.log(`Error: ${e}`)
    process.exit(1);
}

/**
 * Checks-out the vscode git submodule to the latest "solid" release commit/tag.
 * e.g. 1.45.0, 1.45.1, etc.
 */
async function checkoutLatestReleasedVscodeVersion() {
    let v = await getLatestSolidVscodeVersion();
    try {
        await checkoutVscodeVersion(v)
    } catch (e) {
        throw new Error(`Can't checkout ${v}: ${e}`);
    }
}

/** 
 * Returns the latest vscode solid revision
 * This assumes latest version of vscode repo already fetched locally
 */
async function getLatestSolidVscodeVersion() {
    const latestTagSha = (await run('git', ['rev-list', '--tags', '--max-count=1'], vscode())).trim();
    const latestTag = (await run('git', ['describe', '--tags', latestTagSha], vscode())).trim();

    return latestTag;
}

/**
 * Checks-out the vscode git submodule to a specified tag or commit
 * @param tag a vscode version tag or commit SHA
 */
async function checkoutVscodeVersion(tag) {
    try {
        (await run('git', ['checkout', tag], vscode())).trim();
    } catch (e) {
        throw new Error('Cannot find vscode tag or SHA: ' + tag + '\n');
    }
}
