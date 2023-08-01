const SavedComment = require('../../Domains/comments/entities/SavedComment')
const ReplyCommentRepository = require('../../Domains/comments/ReplyCommentRepository')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const NewReplyComment = require('../../Domains/comments/entities/NewReplyComment')

class ReplyCommentRepositoryPostgres extends ReplyCommentRepository {
  constructor ({
    pool,
    idGenerator
  }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async create (useCasePayload) {
    const newReplyComment = new NewReplyComment(useCasePayload)
    const { content, owner, commentId } = newReplyComment

    const currentDate = new Date().toISOString()

    const id = `comment-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, date, owner, is_deleted',
      values: [id, content, currentDate, owner]
    }

    const result = await this._pool.query(query)

    await this._pool.query({
      text: `INSERT INTO link_reply_comment
            VALUES($1, $2)`,
      values: [commentId, id]
    })

    return new SavedComment(result.rows[0])
  }

  async findAllFromComment (commentId) {
    const query = {
      text: `SELECT comments.id, content, date, owner, is_deleted FROM link_reply_comment
              INNER JOIN comments ON comments.id = reply_id
              WHERE (comment_id = $1)
              ORDER BY date ASC`,
      values: [commentId]
    }
    const result = await this._pool.query(query)
    return result?.rows
  }

  async findOneById (id) {
    const query = {
      text: `SELECT * FROM link_reply_comment
            INNER JOIN comments ON comments.id = reply_id
            WHERE reply_id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new NotFoundError('comment tidak ditemukan')
    return new SavedComment(result.rows?.[0])
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

module.exports = ReplyCommentRepositoryPostgres
