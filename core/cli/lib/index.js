'use strict';

module.exports = core;

const path = require('path')
const pkg = require('../package.json');
const constant = require('./const');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const log = require('@press-cli-dev/log');
const commander = require('commander')
// const init = require('@press-cli-dev/init')
const exec = require('@press-cli-dev/exec')
const program = new commander.Command();
async function core() {
    try {
        await prepare()
        registryCommand()
    } catch (e) {
        log.error(e.message)
        if (program._optionValues.debug) {
            console.log(e)
        }
    }
}
function registryCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('[command] [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启debug模式', false)
        .option('-e, --envName <envName>', '获取环境变量名称', '')
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试路径', '');
    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化')
        .action(exec);
    //监听debug模式
    program
        .on('option:debug', function() {
            if (program._optionValues.debug) {
                process.env.LOG_LEVEL = 'verbose'
            } else {
                process.env.LOG_LEVEL = 'info'
            }
            log.level = process.env.LOG_LEVEL;
            // log.verbose('test')
        });
    //监听targetPath
    program
        .on('option:targetPath', function() {
            console.log(program._optionValues.targetPath)
            process.env.CLI_TARGET_PATH = program._optionValues.targetPath;
        });
    //监听未知命令
    program
        .on('command:*', function(obj) {
            const availableCommands = program.commands.map(cmd => cmd.name())
            // if (obj.length < 1) {
            //     program.outputHelp()
            // }
            console.log(colors.red(`未知命令：${obj.toString()}
可执行命令：${availableCommands.toString()}`))
        });
    program.parse(process.argv)
}
async function prepare() {
    checkPkgVersion()
    checkRoot()
    checkUserHome();
    checkEnv()
    await checkGlobalUpdate()
}
async function checkGlobalUpdate() {
    // 1.获取当前版本号和模块名
    const curentVersion = pkg.version;
    const npmName = pkg.name;
    // 2.调用npm API 获取所有的版本号
    const { getNpmSemverVersion } = require('@press-cli-dev/get-npm-info')
    const lastVersion = await getNpmSemverVersion(curentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, curentVersion)) {
        //         log.warn('版本更新提示', colors.yellow(`请手动更新${npmName},当前版本：${curentVersion},最新的的的的的版本：${lastVersion}
        // 更新命令： npm install -g ${npmName}`))
    }
    // 3.提取所有的版本号，比对当前版本号之间的差异
    // 4.获取最新版本号，提示用户更新到最新版本

}
function checkPkgVersion() {
    log.notice('cli', pkg.version);
}
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前用户主目录不存在'))
    }
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
