/* istanbul ignore file */
const SavedThread = require('../src/Domains/threads/entities/SavedThread')
const pool = require('../src/Infrastructures/database/postgres/pool')

const ThreadsTableTestHelper = {
  async create ({
    id = 'thread-123',
    title = 'thread-title',
    body = 'thread-body',
    date = '2021-08-08T07:19:09.775Z',
    owner = 'user-123'
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, date, owner]
    }

    await pool.query(query)
  },

  async findAll () {
    const query = {
      text: 'SELECT * FROM threads'
    }

    const result = await pool.query(query)
    return result.rows
  },

  async findOneById (id) {
    const query = {
      text: 'SELECT * FROM threads WHERE (id = $1) AND (is_deleted = false)',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows?.[0] ? new SavedThread(result.rows?.[0]) : undefined
  },

  async cleanTable () {
    await pool.query('DELETE FROM threads WHERE 1=1')
  }
}

module.exports = ThreadsTableTestHelper
