const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const NewThread = require('../../../Domains/threads/entities/NewThread')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' })
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable()
    await pool.end()
  })

  describe('create function', () => {
    it('should persist new thread and return saved thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123'
      })
      const fakeIdGenerator = () => '123' // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper
      })

      // Action
      const savedThread = await threadRepositoryPostgres.create(newThread)

      // Assert
      expect(savedThread).toBeInstanceOf(SavedThread)
      expect(savedThread.title).toStrictEqual('thread-title')
      expect(savedThread.body).toStrictEqual('thread-body')
      expect(savedThread.owner).toStrictEqual('user-123')

      const threads = await ThreadsTableTestHelper.findOneById('thread-123')
      expect(threads).toBeInstanceOf(SavedThread)
      expect(threads.title).toStrictEqual('thread-title')
      expect(threads.body).toStrictEqual('thread-body')
      expect(threads.owner).toStrictEqual('user-123')
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved thread correctly', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper
      })
      await ThreadsTableTestHelper.create({
        id: 'thread-1',
        owner: 'user-123',
        title: 'thread-title',
        body: 'thread-body',
        date: '2021-08-08T07:19:09.775Z'
      })
      await ThreadsTableTestHelper.create({
        id: 'thread-2',
        owner: 'user-123',
        title: 'thread-title',
        body: 'thread-body',
        date: '2021-08-08T07:19:09.775Z'
      })

      // Assert & Assert
      const threads = await threadRepositoryPostgres.findAll()
      expect(threads).toHaveLength(2)
      expect(threads).toEqual([
        {
          id: 'thread-1',
          owner: 'user-123',
          title: 'thread-title',
          body: 'thread-body',
          date: '2021-08-08T07:19:09.775Z',
          is_deleted: false
        },
        {
          id: 'thread-2',
          owner: 'user-123',
          title: 'thread-title',
          body: 'thread-body',
          date: '2021-08-08T07:19:09.775Z',
          is_deleted: false
        }
      ])
    })
  })

  describe('findOneById function', () => {
    it('should return NotFoundError when nothing thread with threadId found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({ pool })

      // Action & Assert
      expect(threadRepositoryPostgres.findOneById('thread-1'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return thread when there is thread with id found', async () => {
      // Arrange
      const savedThread = new SavedThread({
        id: 'thread-123',
        owner: 'user-123',
        title: 'thread-title',
        body: 'thread-body',
        date: '2021-08-08T07:19:09.775Z',
        is_deleted: false
      })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({ pool })

      // action
      await ThreadsTableTestHelper.create(savedThread)
      const thread = await threadRepositoryPostgres.findOneById('thread-123')

      // Assert
      expect(thread.id).toStrictEqual('thread-123')
      expect(thread.title).toStrictEqual('thread-title')
      expect(thread.body).toStrictEqual('thread-body')
      expect(thread.date).toStrictEqual('2021-08-08T07:19:09.775Z')
      expect(thread.owner).toStrictEqual('user-123')
      expect(thread.is_deleted).toStrictEqual(false)
    })
  })

  describe('remove function', () => {
    it('should delete thread from database', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper
      })
      await ThreadsTableTestHelper.create({
        id: 'thread-321',
        owner: 'user-123'
      })

      // Action
      await expect(threadRepositoryPostgres.remove('thread-321', 'user-123'))
        .resolves
        .toBeUndefined()

      // Assert
      const threads = await ThreadsTableTestHelper.findAll()
      expect(threads).toHaveLength(1)
      expect(threads[0].id).toStrictEqual('thread-321')
      expect(threads[0].is_deleted).toStrictEqual(true)

      const thread = await ThreadsTableTestHelper.findOneById('thread-321')
      expect(thread).toBeUndefined()
    })
  })

  describe('verifyyOwner function', () => {
    it('Should return Authorization Error if the user is not the comment owner', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({ pool })
      const savedThread = new SavedThread({
        id: 'thread-123',
        owner: 'user-123',
        title: 'thread-title',
        body: 'thread-body',
        date: '2021-08-08T07:19:09.775Z',
        is_deleted: false
      })

      // Action & Assert
      expect(() => threadRepositoryPostgres.verifyOwner(savedThread, 'user-xxx'))
        .toThrowError(AuthorizationError)
    })

    it('Should return true if the user is the comment owner', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({ pool })
      const savedThread = new SavedThread({
        id: 'thread-123',
        owner: 'user-123',
        title: 'thread-title',
        body: 'thread-body',
        date: '2021-08-08T07:19:09.775Z',
        is_deleted: false
      })

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyOwner(savedThread, 'user-123'))
        .toStrictEqual(true)
    })
  })
})
