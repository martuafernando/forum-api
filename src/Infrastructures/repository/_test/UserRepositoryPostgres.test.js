const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const RegisterUser = require('../../../Domains/users/entities/RegisterUser')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const pool = require('../../database/postgres/pool')
const UserRepositoryPostgres = require('../UserRepositoryPostgres')

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'username' }) // memasukan user baru dengan username dicoding
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('username')).rejects.toThrowError(InvariantError)
    })

    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('username')).resolves.not.toThrowError(InvariantError)
    })
  })

  describe('addUser function', () => {
    it('should persist register user and return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'username',
        password: 'secret_password',
        fullname: 'FullName'
      })
      const fakeIdGenerator = () => '123' // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      await userRepositoryPostgres.addUser(registerUser)

      // Assert
      const users = await UsersTableTestHelper.findUsersById('user-123')
      expect(users).toHaveLength(1)
    })

    it('should return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'username',
        password: 'secret_password',
        fullname: 'FullName'
      })
      const fakeIdGenerator = () => '123' // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator)

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser)

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'username',
        fullname: 'FullName'
      }))
    })
  })

  describe('getPasswordByUsername', () => {
    it('should throw InvariantError when user not found', () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action & Assert
      return expect(userRepositoryPostgres.getPasswordByUsername('username'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should return username password when user is found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({
        username: 'username',
        password: 'secret_password'
      })

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername('username')
      expect(password).toBe('secret_password')
    })
  })

  describe('getIdByUsername', () => {
    it('should throw InvariantError when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername('username'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should return user id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'username' })
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action
      const owner = await userRepositoryPostgres.getIdByUsername('username')

      // Assert
      expect(owner).toEqual('user-321')
    })
  })

  describe('findOneById', () => {
    it('should return undefined when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(userRepositoryPostgres.findOneById('username'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return user correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'username' })
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {})

      // Action
      const user = await userRepositoryPostgres.findOneById('user-321')

      // Assert
      expect(user).toBeDefined()
    })
  })
})
