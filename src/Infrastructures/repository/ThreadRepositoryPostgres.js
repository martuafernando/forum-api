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
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, date, owner, is_deleted',
      values: [id, title, body, currentDate, owner]
    }

    const result = await this._pool.query(query)

    return new SavedThread(result.rows[0])
  }

  async findAll () {
    const query = {
      text: 'SELECT * FROM threads'
    }
    const result = await this._pool.query(query)
    return result?.rows
  }

  async findOneById (id) {
    const query = {
      text: `SELECT * FROM threads
            WHERE id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) throw new NotFoundError('thread tidak ditemukan')
    return new SavedThread(result.rows[0])
  }

  async remove (threadId) {
    const query = {
      text: `UPDATE threads
        SET is_deleted = true
        WHERE id = $1`,
      values: [threadId]
    }
    await this._pool.query(query)
  }

  verifyOwner (thread, userId) {
    const savedThread = new SavedThread(thread)
    if (savedThread.owner !== userId) throw new AuthorizationError('Forbidden')
    return true
  }
}

module.exports = ThreadRepositoryPostgres
