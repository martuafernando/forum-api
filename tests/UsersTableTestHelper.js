/* istanbul ignore file */
const InvariantError = require('../src/Commons/exceptions/InvariantError')
const pool = require('../src/Infrastructures/database/postgres/pool')

const UsersTableTestHelper = {
  async addUser ({
    id = 'user-123', username = 'username', password = 'secret', fullname = 'FullName'
  }) {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname]
    }

    await pool.query(query)
  },

  async findUsersById (id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async findAll () {
    const query = {
      text: 'SELECT * FROM users'
    }

    const result = await pool.query(query)
    return result.rows
  },

  async findOneById (id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows?.[0]
  },

  async getIdByUsername (username) {
    const query = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username]
    }

    const result = await pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('user tidak ditemukan')
    }

    const { id } = result.rows[0]

    return id
  },

  async cleanTable () {
    await pool.query('DELETE FROM users WHERE 1=1')
  }
}

module.exports = UsersTableTestHelper
