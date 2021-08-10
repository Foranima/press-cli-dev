'use strict';
const path = require('path')

function formatPath(p) {
    // TODO
    if (p && typeof p === 'string') {
        const sep = path.sep;
        // 兼容windows通配符
        if (sep === '/') {
            return p
        } else {
            return p.replace(/\\/g, '/')
        }
    }
    return p
}
module.exports = formatPath;
