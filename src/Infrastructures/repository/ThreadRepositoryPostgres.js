const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NewThread = require('../../Domains/threads/entities/NewThread');
const SavedThread = require('../../Domains/threads/entities/SavedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor({
    pool,
    idGenerator,
    userRepository,
    commentRepository
  }) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._userRepositoryPostgres = userRepository
    this._commentRepositoryPostgres = commentRepository
  }

  async create(newThread) {
    const { title, body, owner } = newThread;
    const currentDate = new Date().toISOString()
    
    if(!await this._userRepositoryPostgres.findOneById(owner)) throw new InvariantError('user tidak ditemukan')
    
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, date, owner',
      values: [id, title, body, currentDate, owner],
    };

    const result = await this._pool.query(query);

    return new NewThread({ ...result.rows[0] });
  }

  async findAll(customQuery) {
    const query = {
      text: 'SELECT * FROM threads WHERE is_deleted = false'
    };
    const result = await this._pool.query(query);
    return result?.rows
  }

  async findOneById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE (id = $1) AND (is_deleted = false)',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows?.[0] ? new SavedThread(result.rows?.[0]) : undefined;
  }

  async remove(threadId, ownerId) {
    const thread = await this.findOneById(threadId)
    if (!thread) throw new InvariantError('Thread tidak ditemukan')
    if (thread.owner !== ownerId) throw new AuthorizationError('Forbidden')

    const query = {
      text: `UPDATE threads
        SET is_deleted = true
        WHERE id = $1`,
      values: [threadId]
    };
    await this._pool.query(query);
  }
}

module.exports = ThreadRepositoryPostgres;
