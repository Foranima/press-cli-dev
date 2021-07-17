'use strict';

const log = require('npmlog');
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断debug模式
log.heading = 'press-cli' // 修改前缀
log.headingStyle = { fg: 'red', bg: 'black' } // 修改前缀样式
log.addLevel('success', 2500, { fg: 'green', bg: 'black', bold: true })  // 添加自定义样式


module.exports = log;
