'use strict';
const pkgDir = require('pkg-dir').sync;
const path = require('path')
const { isObject } = require('@press-cli-dev/utils')
const { getDeaultregistry, getNpmLatestVersion } = require('@press-cli-dev/get-npm-info')
const formatPath = require('@press-cli-dev/format-path')
const pathExists = require('path-exists').sync
const npmInstall = require('npminstall')
const fse = require('fs-extra')
class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options不能为空！')
        }
        if (!isObject(options)) {
            throw new Error('Package类的options参数必须为对象')
        }
        // package路径
        this.targetPath = options.targetPath
        // package缓存路径
        this.storeDir = options.storeDir
        // package的名称
        this.packageName = options.packageName
        // package的version
        this.packageVersion = options.packageVersion
        // package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')
    }
    async prepare() {
        //如果真实路径存在，而缓存路径不存在的时候--生成缓存目录
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir)
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
        console.log(this.packageVersion)
    }
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }
    getspecificCacheFilePath(packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)

    }
    // 判断package是否存在
    async exists() {
        if (this.storeDir) {
            //存在即是缓存路径
            await this.prepare()
            return path.exists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath)
        }
    }
    // 安装package
    async install() {
        await this.prepare()
        return npmInstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDeaultregistry(),
            pkgs: [{ name: this.packageName, version: this.packageVersion }],
        })
    }
    // 更新package
    async update() {
        await this.prepare();
        // 1.获取最新的npm模块版本号
        const lastVersion = getNpmLatestVersion(this.packageName);
        // 2.查询最新版本号对应的路径是否存在
        const lastFileVersion = this.getspecificCacheFilePath(lastVersion)
        // 3.如果不存在，则安装这个版本
        if (!pathExists(lastFileVersion)) {
            await npmInstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDeaultregistry(),
                pkgs: [{ name: this.packageName, version: lastVersion }],
            })
            this.packageVersion = lastFileVersion;
        }
        return lastFileVersion;
    }
    // 获取入口文件
    getRootFile() {
        function _getRootFile(targetPath) {
            // 1.获取Package.json所在的路径
            const dir = pkgDir(targetPath)
            if (dir) {
                // 2.读取package.json
                const pkgFile = require(path.resolve(dir, 'package.json'))
                // 3.寻找main或者lib
                if (pkgFile && pkgFile.main) {
                    // 4. 路径兼容mac/windows
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
            return null
        }
        //使用缓存
        if (this.storeDir) {
            _getRootFile(this.cacheFilePath)
        } else {
            return _getRootFile(this.targetPath)
        }

    }

}
module.exports = Package;

