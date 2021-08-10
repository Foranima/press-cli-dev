'use strict';
const cmd = require('@press-cli-dev/command');
const log = require('@press-cli-dev/log')
const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
class initCommand extends cmd {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._argv[1].force;
    }
    async exec() {
        try {
            // 准备阶段
            const res = await this.prepare();
            // 下载模板
            // 安装模板
            console.log('init的业务逻辑')
        } catch (e) {
            log.error(e.message);
        }

    }
    async prepare() {
        const localPath = process.cwd();
        // 判断当前目录是否为空
        if (!this.isEmpty(localPath)) {
            //是否继续创建
            let ifContinue = false;
            if (!this.force) {
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前文件夹不为空，是否继续创建'
                })).ifContinue
            }
            if (!ifContinue) {
                return
            }
            // 是否启动强制更新
            if (ifContinue || this.force) {
                const { isComfirm } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'isComfirm',
                    default: false,
                    message: '是否确认清空当前文件夹下所有文件？'
                })
                if (isComfirm) {
                    fse.emptyDirSync(localPath)
                }
            }
        }
        return await this.getProjectInfo()

    }
    //获取项目基本信息
    async getProjectInfo() {
        const projectInfo = {};
        //选择创建项目还是组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                { name: '项目', value: TYPE_PROJECT },
                { name: '组件', value: TYPE_COMPONENT },
            ]
        })
        //选择创建项目
        if (type === TYPE_PROJECT) {
            // 获取项目的基本信息
            const info = await inquirer.prompt([{
                type: 'input',
                name: 'projectName',
                message: '请输入项目名称',
                default: '',
                validate: function(v) {
                    return /^[a-zA-Z]+([-][a-zA-Z]+[a-zA-Z0-9]*|[_][a-zA-Z]+[a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
                },
                filter: function(v) {
                    return v
                }
            }, {
                type: 'input',
                name: 'projectVersion',
                message: '请输入项目版本号',
                default: '1.0.0',
                validate: function(v) {
                    return !!semver.valid(v);
                },
                filter: function(v) {
                    if (!!semver.valid(v)) {
                        return semver.valid(v)
                    } else {
                        return v
                    }

                }
            }])
            console.log(info)
        } else {

        }
        return projectInfo;
    }
    isEmpty(localPath) {
        let fileList = fs.readdirSync(localPath)
        fileList = fileList.filter(item => (!item.startsWith('.') && ['node_modules'].indexOf(item) < 0))
        return !fileList || fileList.length <= 0
    }
}
function init(argv) {
    new initCommand(argv);
}
module.exports = init;
module.exports.initCommand = initCommand;