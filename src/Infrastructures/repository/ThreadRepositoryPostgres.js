const InvariantError = require('../../Commons/exceptions/InvariantError');
const NewThread = require('../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const UserRepositoryPostgres = require('./UserRepositoryPostgres');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._userRepositoryPostgres = new UserRepositoryPostgres(pool, {})
  }

  async create(newThread) {
    const { title, body, owner } = newThread;
    
    if(!await this._userRepositoryPostgres.findOneById(owner)) throw new InvariantError('user tidak ditemukan')
    
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new NewThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
