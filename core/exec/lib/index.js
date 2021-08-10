'use strict';
const Package = require('@press-cli-dev/package');
const log = require('@press-cli-dev/log');
const SETTINGS = {
    init: '@press-cli-dev/init'
};
const path = require('path');
const CACHE_DIR = 'dependencies/';
const cp = require('child_process');
async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    let storeDir = ''; let pkg;
    const homePath = process.env.CLI_HOME_PATH;
    const comObj = arguments[arguments.length - 1]
    const cmdName = comObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest'

    // log.verbose('targetPath', targetPath)
    // log.verbose('homePath', homePath)

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR); //生成缓存路径 
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath)
        log.verbose('storeDir', storeDir)
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });
        if (await pkg.exists()) {
            // 更新package
            await pkg.update();
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
    }
    const rootFile = pkg.getRootFile()
    if (rootFile) {
        try {
            // 因为arguments是一个数组  require(rootFile)引入一个包，apply接收一个数组，展开这个数组作为参数引入
            const args = Array.from((arguments));
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                    o[key] = cmd[key]
                }
            })
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null,${JSON.stringify(args)} )`
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit' //默认为管道链接，pipe,还有inherit 将用户输入输出 报错信息直接和父进程进行绑定
            })
            child.on('error', e => {
                log.error(e.message)
                process.exit(1)
            })
            child.on('exit', e => {
                log.verbose(`命令执行成功:  ${e}`)
                process.exit(e)
            })
        } catch (error) {
            log.error(error.message)
        }

    }

}
function spawn(command, args, options) {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
    return cp.spawn(cmd, cmdArgs, options || {});
}
module.exports = exec;
