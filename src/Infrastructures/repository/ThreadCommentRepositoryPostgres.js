const SavedComment = require('../../Domains/comments/entities/SavedComment')
const ThreadCommentRepository = require('../../Domains/comments/ThreadCommentRepository')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const NewThreadComment = require('../../Domains/comments/entities/NewThreadComment')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ThreadCommentRepositoryPostgres extends ThreadCommentRepository {
  constructor ({
    pool,
    idGenerator
  }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async create (useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload)
    const { threadId, content, owner } = newThreadComment
    const currentDate = new Date().toISOString()

    const id = `comment-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, date, owner, "likeCount", is_deleted',
      values: [id, content, currentDate, owner]
    }

    const result = await this._pool.query(query)

    await this._pool.query({
      text: `INSERT INTO link_thread_comment
            VALUES($1, $2)`,
      values: [threadId, id]
    })

    return new SavedComment(result.rows[0])
  }

  async findAllFromThread (threadId) {
    const query = {
      text: `SELECT comments.id, "likeCount", content, date, owner, is_deleted FROM link_thread_comment
              INNER JOIN comments ON comments.id = comment_id
              WHERE thread_id = $1
              ORDER BY date ASC`,
      values: [threadId]
    }
    const result = await this._pool.query(query)
    return result?.rows
  }

  async findOneById (id) {
    const query = {
      text: `SELECT * FROM link_thread_comment
            INNER JOIN comments ON comments.id = comment_id
            WHERE comment_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new NotFoundError('comment tidak ditemukan')
    return new SavedComment(result.rows[0])
  }

  async likeComment (userid, commentId) {
    await this._pool.query({
      text: `INSERT INTO link_user_like_comment
            VALUES($1, $2)`,
      values: [userid, commentId]
    })

    await this._pool.query({
      text: `UPDATE comments
        SET "likeCount" = "likeCount" + 1
        WHERE id = $1`,
      values: [commentId]
    })
  }

  async unlikeComment (userid, commentId) {
    await this._pool.query({
      text: `DELETE FROM link_user_like_comment
            WHERE user_id = $1 AND comment_id = $2`,
      values: [userid, commentId]
    })

    await this._pool.query({
      text: `UPDATE comments
        SET "likeCount" = "likeCount" - 1
        WHERE id = $1`,
      values: [commentId]
    })
  }

  async isUserLiked (userid, commentId) {
    const result = await this._pool.query({
      text: `SELECT * FROM link_user_like_comment
            WHERE user_id = $1 AND comment_id = $2`,
      values: [userid, commentId]
    })

    if (result.rows.length === 0) return false
    return true
  }

  async remove (id) {
    const query = {
      text: `UPDATE comments
        SET is_deleted = true
        WHERE id = $1`,
      values: [id]
    }
    await this._pool.query(query)
  }

  verifyOwner (thread, userId) {
    const savedComment = new SavedComment(thread)
    if (savedComment.owner !== userId) throw new AuthorizationError('Forbidden')
    return true
  }
}

module.exports = ThreadCommentRepositoryPostgres
