const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')
const NewThread = require('../../../Domains/threads/entities/NewThread')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')

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
    it('should throw InvariantError when user not found', () => {
      // Arrange
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-xxx',
      })
      const fakeIdGenerator = () => '123' // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });

      // Action & Assert
      return expect(threadRepositoryPostgres.create(newThread))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should persist new thread and return saved thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
      })
      const fakeIdGenerator = () => '123' // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });

      // Action
      await threadRepositoryPostgres.create(newThread)

      // Assert
      const threads = await ThreadsTableTestHelper.findOneById('thread-123');
      expect(threads).toBeInstanceOf(SavedThread);
      expect(threads.title).toEqual(newThread.title);
      expect(threads.body).toEqual(newThread.body);
      expect(threads.owner).toEqual(newThread.owner);
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved thread correctly', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });
      await ThreadsTableTestHelper.create({ id: 'thread-1', owner: 'user-123' })
      await ThreadsTableTestHelper.create({ id: 'thread-2', owner: 'user-123' })

      // Assert & Assert
      const threads = await threadRepositoryPostgres.findAll();
      expect(threads).toHaveLength(2);
    })
  })

  describe('findOneById function', () => {
    it('should return empty array when nothing thread with threadId found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });

      // Action & Assert
      const threads = await threadRepositoryPostgres.findOneById('thread-1');
      expect(threads).toBeUndefined();
    })

    it('should return thread when there is thread with threadId found', async () => {
      // Arrange
      const savedThread = new SavedThread({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      })
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });

      // action
      await ThreadsTableTestHelper.create(savedThread)
      const threads = await threadRepositoryPostgres.findOneById('thread-123');

      //Assert
      expect(threads).toBeInstanceOf(SavedThread)
      expect(threads.id).toEqual(savedThread.id)
      expect(threads.title).toEqual(savedThread.title)
      expect(threads.body).toEqual(savedThread.body)
      expect(threads.date).toEqual(savedThread.date)
      expect(threads.owner).toEqual(savedThread.owner)
    })
  })

  describe('remove function', () => {
    it('should throw InvariantError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });

      // Action & Assert
      expect(threadRepositoryPostgres.remove('thread-1'))
        .rejects
        .toThrowError(InvariantError)
    })
  })

  it('should delete thread from database', async () => {
    // Arrange
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        commentRepository: CommentsTableTestHelper
      });
    await ThreadsTableTestHelper.create({ id: 'thread-1', owner: 'user-123' })

    // Action
    await threadRepositoryPostgres.remove('thread-1')

    // Assert
    const thread = await ThreadsTableTestHelper.findOneById('thread-1')
    expect(thread).toBeUndefined()
  })
})