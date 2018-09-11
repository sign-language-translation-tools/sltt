// Stars (in FontAwesome) to show video review status
// 1 star means "unreviewed"
export const statuses = [
    '\uf008\u2009',   // 1 film
    '\uf008\u2009\uf008\u2009',
    '\uf008\u2009\uf008\u2009\uf008\u2009',
    '\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009',
    '\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009',
    '\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009\uf008\u2009',
    '',
    '',
    '',
    '',
    '\uf1f8'   // deleted status
]

export const deletedStatus = statuses.length - 1
