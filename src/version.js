/**
 * version-related utility functions
 */
const fetch = require('node-fetch');
const fs = require('fs')
const { run, vscode } = require('./paths.js');

const OPEN_VSX_ORG_URL = 'https://open-vsx.org/api'

// @ts-check
/** 
 * Returns the version to use when packaging built-in extensions. Based
 * on VS Code submodule version and whether it's to be a solid or preview
 * release
 * 
 * @param releaseType latest or next
 */
async function computeVersion(releaseType) {
    const vscodePck = JSON.parse(fs.readFileSync(vscode('package.json'), 'utf-8'));
    let ver = vscodePck.version || '0.0.1';
    const shortRevision = (await run('git', ['rev-parse', '--short', 'HEAD'], vscode())).trim();

    return new Promise((resolve) => {
        // use VS Code version and SHA when packaging 'next'
        if (releaseType === 'next') {            
            let [major, minor, bugfix] = ver.split('.');
            // no way to know if the next VS Code release will
            // be bugfix or minor. Let's step the last number.
            bugfix++;
            ver = `${major}.${minor}.${bugfix}-next.${shortRevision}`;
        }
        resolve(ver);
    });
}

/** 
 * Returns whether an extension is already published on the currently
 * set registry (default: https://open-vsx.org) 
 */
async function isPublished(version, extension, namespace = 'vscode') {
    let registry = process.env.OVSX_REGISTRY_URL ? process.env.OVSX_REGISTRY_URL : OPEN_VSX_ORG_URL;
    const response = await fetch(`${registry}/${namespace}/${extension}`);
    const json = await response.json();

    // namespace/ext not found
    if (json.error) {
        return false;
    }

    // look-for a specific version
    for (var i = 0; i < Object.keys(json.allVersions).length; i++) {
        if (Object.keys(json.allVersions)[i] == version) {
            return true;
        }
    }
    return false;
}

module.exports = { computeVersion, isPublished /*, getLatestSolidVscodeVersion, checkoutVscodeVersion, checkoutLatestReleasedVscodeVersion */ };