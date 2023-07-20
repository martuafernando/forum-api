/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('link_thread_comment', {
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('link_thread_comment');
};
