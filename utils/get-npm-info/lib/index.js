'use strict';

const axios = require('axios')
const semver = require('semver')
const urlJoin = require('url-join')

function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null
    }
    const reg = registry || getDeaultregistry()
    const url = urlJoin(reg, npmName)
    return axios.get(url)
        .then(res => {
            if (res.status === 200) {
                return res.data
            }
            return null
        })
        .catch((err) => {
            return Promise.reject(err)
        })
}
async function getNpmLatestVersion(npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    if (versions) {
        versions.sort((a, b) => semver.gt(b, a))[0]
    }
    return null
}
async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions)
    } else {
        return [];
    }
}
function getDeaultregistry(isOrginal = false) {
    return isOrginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}
function getSemverVersions(baseVersion, versions) {
    versions = versions
        .filter(version => semver.satisfies(version, `>=${baseVersion}`))
        .sort((a, b) => semver.gt(b, a))
    return versions;
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
    return null;
}
module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion,
    getDeaultregistry,
    getNpmLatestVersion
};