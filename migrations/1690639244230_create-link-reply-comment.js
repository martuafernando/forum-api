/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('link_reply_comment', {
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    reply_id: {
      type: 'VARCHAR(50)',
      notNull: true
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('link_reply_comment')
}
