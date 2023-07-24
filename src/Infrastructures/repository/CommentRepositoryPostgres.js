const InvariantError = require('../../Commons/exceptions/InvariantError');
const SavedComment = require('../../Domains/comments/entities/SavedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor({
    pool,
    idGenerator,
    threadRepository,
    userRepository,
  }) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._userRepositoryPostgres = userRepository
    this._threadRepositoryPostgres = threadRepository
  }

  async createThreadComment(newComment) {
    const threadId = newComment.target
    if(!await this._threadRepositoryPostgres.findOneById(threadId)) throw new NotFoundError('thread tidak ditemukan')
    const { content, owner } = newComment;
    const currentDate = new Date().toISOString()
    
    if(!await this._userRepositoryPostgres.findOneById(owner)) throw new InvariantError('user tidak ditemukan')
    
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, date, owner',
      values: [id, content, currentDate, owner],
    };

    const result = await this._pool.query(query);

    await this._pool.query({
      text: `INSERT INTO link_thread_comment
            VALUES($1, $2)`,
      values: [threadId, id],
    })

    return new SavedComment(result.rows[0]);
  }

  async findAllFromThread(threadId) {
    const query = {
      text: `SELECT comments.id, content, date, owner, is_deleted FROM link_thread_comment
              INNER JOIN comments ON comments.id = comment_id
              WHERE (target_id = $1)
              ORDER BY date ASC`,
      values: [threadId]
    };
    const result = await this._pool.query(query);
    return result?.rows
  }

  async findOneById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE (id = $1) AND (is_deleted = false)',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows?.[0] ? new SavedComment(result.rows?.[0]) : undefined;
  }

  async remove({ id, target, owner }) {
    const comment = await this.findOneById(id)
    if (!comment) throw new NotFoundError('comment tidak ditemukan')
    if (comment.owner !== owner) throw new AuthorizationError('Forbidden')

    await this._pool.query({
      text: `DELETE FROM link_thread_comment
        WHERE (target_id = $1) AND (comment_id = $2)`,
      values: [target, owner]
    })

    const query = {
      text: `UPDATE comments
        SET is_deleted = true
        WHERE id = $1`,
      values: [id]
    };
    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
