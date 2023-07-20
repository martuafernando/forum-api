const InvariantError = require('../../Commons/exceptions/InvariantError');
const NewComment = require('../../Domains/comments/entities/NewComment');
const SavedComment = require('../../Domains/comments/entities/SavedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

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

  async createThreadComment(newComment, threadId) {
    if(!await this._threadRepositoryPostgres.findOneById(threadId)) throw new InvariantError('Thread tidak ditemukan')
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

    return new NewComment({ ...result.rows[0] });
  }

  async findAllFromThread(threadId) {
    const query = {
      text: `SELECT * FROM link_thread_comment
        WHERE thread_id = $1`,
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

  async remove(commentId) {
    if (!await this.findOneById(commentId)) throw new InvariantError('Comment tidak ditemukan')

    const query = {
      text: `UPDATE comments
        SET is_deleted = true
        WHERE id = $1`,
      values: [commentId]
    };
    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
