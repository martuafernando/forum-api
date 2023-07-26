const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')
const NewComment = require('../../../Domains/comments/entities/NewComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' })
    await ThreadsTableTestHelper.create({ id: 'thread-123' })
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('createThreadComment function', () => {
    it('should throw InvariantError when user not found', () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-xxx',
        target: 'thread-123'
      })
      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })

      // Action & Assert
      expect(commentRepositoryPostgres.createThreadComment(newComment, 'thread-123'))
        .rejects
        .toThrowError(InvariantError)
    })

    it('should persist new thread comment and return saved thread comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-123',
        target: 'thread-123'
      })
      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        threadRepository: ThreadsTableTestHelper,
        userRepository: UsersTableTestHelper
      })

      // Action
      await commentRepositoryPostgres.createThreadComment(newComment)

      // Assert
      const comments = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toEqual(newComment.content)
      expect(comments.owner).toEqual(newComment.owner)
    })
  })

  describe('createReplyComment function', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-123' })
    })

    it('should persist new thread comment and return saved thread comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-123',
        target: 'comment-123'
      })
      const fakeIdGenerator = () => '234' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })

      // Action
      await commentRepositoryPostgres.createReplyComment(newComment)

      // Assert
      const comments = await CommentsTableTestHelper.findOneById('comment-234')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toEqual(newComment.content)
      expect(comments.owner).toEqual(newComment.owner)
    })

    it('should return NotFoundError when comment target not found ', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-123',
        target: 'comment-xxx'
      })
      const fakeIdGenerator = () => '234' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })

      // Action & Assert
      expect(commentRepositoryPostgres.createReplyComment(newComment))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return InvariantError when user not found', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-xxx',
        target: 'comment-123'
      })
      const fakeIdGenerator = () => '234' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })

      // Action & Assert
      expect(commentRepositoryPostgres.createReplyComment(newComment))
        .rejects
        .toThrowError(InvariantError)
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-1', owner: 'user-123' })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-2', owner: 'user-123' })

      // Assert & Assert
      const comments = await commentRepositoryPostgres.findAllFromTarget('thread-123')
      expect(comments).toHaveLength(2)
    })
  })

  describe('findOneById function', () => {
    it('should return empty array when no comment with id found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })

      // Action & Assert
      const comments = await commentRepositoryPostgres.findOneById('comment-1')
      expect(comments).toBeUndefined()
    })

    it('should return comment when there is comment with id found', async () => {
      // Arrange
      const savedComment = new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z'
      })
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })

      // action
      await CommentsTableTestHelper.createThreadComment(savedComment)
      const comments = await commentRepositoryPostgres.findOneById('comment-123')

      // Assert
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.id).toEqual(savedComment.id)
      expect(comments.title).toEqual(savedComment.title)
      expect(comments.content).toEqual(savedComment.content)
      expect(comments.date).toEqual(savedComment.date)
      expect(comments.owner).toEqual(savedComment.owner)
    })
  })

  describe('remove function', () => {
    it('should throw InvariantError when target comment not found', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        target: 'thread-xxx',
        owner: 'user-123'
      }
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper,
      })

      // Action & Assert
      expect(commentRepositoryPostgres.remove(useCasePayload))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        target: 'thread-123',
        owner: 'user-123'
      }
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })
      await CommentsTableTestHelper.createThreadComment(useCasePayload)

      // Action & Assert
      await expect(commentRepositoryPostgres.remove({
        id: useCasePayload.id,
        target: useCasePayload.target,
        owner: 'user-xxx'
      }))
        .rejects
        .toThrowError(AuthorizationError)
    })

    it('should delete comment from database', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        target: 'thread-123',
        owner: 'user-123'
      }

      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      })
      await CommentsTableTestHelper.createThreadComment(useCasePayload)

      // Action
      await commentRepositoryPostgres.remove(useCasePayload)

      // Assert
      const comment = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comment).toBeUndefined()
    })
  })
})
