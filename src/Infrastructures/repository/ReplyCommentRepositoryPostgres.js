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
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, date, owner',
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
              INNER JOIN comments ON comments.id = comment_id
              WHERE (comment_id = $1)
              ORDER BY date ASC`,
      values: [commentId]
    }
    const result = await this._pool.query(query)
    return result?.rows
  }

  async findOneById (id) {
    const query = {
      text: 'SELECT * FROM comments WHERE (id = $1) AND (is_deleted = false)',
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new NotFoundError('comment tidak ditemukan')
    return new SavedComment(result.rows?.[0])
  }

  async remove ({ id, owner }) {
    const reply = await this.findOneById(id)

    if (!reply) throw new NotFoundError('balasan tidak ditemukan')
    if (reply.owner !== owner) throw new AuthorizationError('Forbidden')

    await this._pool.query({
      text: `DELETE FROM link_reply_comment
        WHERE (comment_id = $1) AND (comment_id = $2)`,
      values: [reply.commentId, id]
    })

    const query = {
      text: `UPDATE comments
        SET is_deleted = true
        WHERE id = $1`,
      values: [id]
    }
    await this._pool.query(query)
  }
}

module.exports = ReplyCommentRepositoryPostgres
