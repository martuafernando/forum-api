/* istanbul ignore file */
const SavedComment = require('../src/Domains/comments/entities/SavedComment');
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async createThreadComment({
    id = 'comment-123',
    content = 'comment-content',
    date = '2021-08-08T07:19:09.775Z',
    owner = 'user-123',
  }, threadId ='thread-123') {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4)',
      values: [id, content, date, owner],
    };

    await pool.query(query);
    await pool.query({
      text: `INSERT INTO link_thread_comment
            VALUES($1, $2)`,
      values: [threadId, id],
    })
  },

  async findOneById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE (id = $1) AND (is_deleted = false)',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows?.[0] ? new SavedComment(result.rows?.[0]) : undefined;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM link_thread_comment WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
