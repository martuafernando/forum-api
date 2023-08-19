/* istanbul ignore file */
const SavedComment = require('../src/Domains/comments/entities/SavedComment')
const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentsTableTestHelper = {
  async createThreadComment ({
    id = 'comment-123',
    content = 'comment-content',
    date = '2021-08-08T07:19:09.775Z',
    target = 'thread-123',
    owner = 'user-123'
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4)',
      values: [id, content, date, owner]
    }

    await pool.query(query)
    await pool.query({
      text: `INSERT INTO link_thread_comment
            VALUES($1, $2)`,
      values: [target, id]
    })
  },

  async createReplyComment ({
    id = 'comment-123',
    content = 'comment-content',
    date = '2021-08-08T07:19:09.775Z',
    target = 'thread-123',
    owner = 'user-123'
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4)',
      values: [id, content, date, owner]
    }

    await pool.query(query)
    await pool.query({
      text: `INSERT INTO link_reply_comment
            VALUES($1, $2)`,
      values: [target, id]
    })
  },

  async setCommentLike (commentId, totalLike) {
    await pool.query({
      text: `UPDATE comments
        SET "likeCount" = $2
        WHERE id = $1`,
      values: [commentId, totalLike]
    })
  },

  async setUserLikeComment (userId, commentId) {
    await pool.query({
      text: `INSERT INTO link_user_like_comment
            VALUES($1, $2)`,
      values: [userId, commentId]
    })
  },

  async findOneById (id) {
    const query = {
      text: 'SELECT * FROM comments WHERE (id = $1) AND (is_deleted = false)',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows?.[0] ? new SavedComment(result.rows?.[0]) : undefined
  },

  async findAll () {
    const query = {
      text: 'SELECT * FROM comments'
    }

    const result = await pool.query(query)
    return result.rows
  },

  async findAllReplies (commentId) {
    const query = {
      text: `SELECT * FROM link_reply_comment
            INNER JOIN comments ON comments.id = reply_id
            WHERE (comment_id = $1)`,
      values: [commentId]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM link_thread_comment WHERE 1=1')
    await pool.query('DELETE FROM link_reply_comment WHERE 1=1')
    await pool.query('DELETE FROM link_user_like_comment WHERE 1=1')
    await pool.query('DELETE FROM comments WHERE 1=1')
  }
}

module.exports = CommentsTableTestHelper
