'use strict';

module.exports = core;

let args;
const path = require('path')
const pkg = require('../package.json');
const constant = require('./const');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const log = require('@press-cli-dev/log');

async function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome();
        checkInputArgs()
        checkEnv()
        await checkGlobalUpdate()
    } catch (e) {
        log.error(e.message)
    }
}
async function checkGlobalUpdate() {
    // 1.获取当前版本号和模块名
    const curentVersion = pkg.version;
    const npmName = pkg.name;
    // 2.调用npm API 获取所有的版本号
    const { getNpmSemverVersion } = require('@press-cli-dev/get-npm-info')
    const lastVersion = await getNpmSemverVersion(curentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, curentVersion)) {
        log.warn('版本更新提示', colors.yellow(`请手动更新${npmName},当前版本：${curentVersion},最新的的的的的版本：${lastVersion}
更新命令： npm install -g ${npmName}`))
    }
    // 3.提取所有的版本号，比对当前版本号之间的差异
    // 4.获取最新版本号，提示用户更新到最新版本

}
function checkPkgVersion() {
    log.notice('cli', pkg.version);
}
function checkInputArgs() {
    const minimist = require('minimist');
    args = minimist(process.argv.slice(2))
    checkArgs()
}
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前用户主目录不存在'))
    }
}
function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}
function checkEnv() {
    const dotEnv = require('dotenv');
    let dotenvPath = path.resolve(userHome, '.env');
    if (pathExists(dotenvPath)) {
        dotEnv.config({
            path: dotenvPath
        });
    }
    createDefaultconfig();
    log.verbose('环境变量', process.env.CLI_HOME_PATH)
}
function createDefaultconfig() {
    const cliConfig = {
        home: userHome
    };
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}
function checkRoot() {
    const rootCheck = require('root-check');
    rootCheck()
}
function checkNodeVersion() {
    const currentVersion = process.version;
    const lowVersion = constant.LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowVersion)) {
        throw new Error(colors.red(`press-cli 需要安装 v${lowVersion}以上版本的node.js`))
    }
    log.notice(process.version);
}