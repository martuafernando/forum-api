/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('link_user_like_comment', {
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('link_user_like_comment')
}
