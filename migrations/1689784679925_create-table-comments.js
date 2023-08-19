/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    content: {
      type: 'TEXT',
      notNull: true
    },
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE'
    },
    likeCount: {
      type: 'INT',
      notNull: true,
      default: 0
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('comments')
}
