/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('link_target_comment', {
    target_id: {
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
  pgm.dropTable('link_target_comment')
}
