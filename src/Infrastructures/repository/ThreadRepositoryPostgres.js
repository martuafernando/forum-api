const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const SavedThread = require('../../Domains/threads/entities/SavedThread')
const ThreadRepository = require('../../Domains/threads/ThreadRepository')

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor ({
    pool,
    idGenerator
  }) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async create (newThread) {
    const { title, body, owner } = newThread
    const currentDate = new Date().toISOString()

    const id = `thread-${this._idGenerator()}`

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, date, owner',
      values: [id, title, body, currentDate, owner]
    }

    const result = await this._pool.query(query)

    return new SavedThread(result.rows[0])
  }

  async findAll () {
    const query = {
      text: 'SELECT * FROM threads WHERE is_deleted = false'
    }
    const result = await this._pool.query(query)
    return result?.rows
  }

  async findOneById (id) {
    const query = {
      text: `SELECT * FROM threads
            WHERE (id = $1) AND (is_deleted = false)`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new NotFoundError('thread tidak ditemukan')
    return result.rows?.[0]
  }

  async remove (threadId, ownerId) {
    const thread = await this.findOneById(threadId)
    if (thread.owner !== ownerId) throw new AuthorizationError('Forbidden')

    const query = {
      text: `UPDATE threads
        SET is_deleted = true
        WHERE id = $1`,
      values: [threadId]
    }
    await this._pool.query(query)
  }
}

module.exports = ThreadRepositoryPostgres
