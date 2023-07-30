const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres')
const NewThreadComment = require('../../../Domains/comments/entities/NewThreadComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
describe('ThreadCommentRepositoryPostgres', () => {
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

  describe('create function', () => {
    it('should persist new thread comment and return saved thread comment correctly', async () => {
      // Arrange
      const newThreadComment = new NewThreadComment({
        content: 'comment-content',
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator
      })

      // Action
      await commentRepositoryPostgres.create(newThreadComment)

      // Assert
      const comments = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toEqual(newThreadComment.content)
      expect(comments.owner).toEqual(newThreadComment.owner)
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-1', owner: 'user-123' })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-2', owner: 'user-123' })

      // Assert & Assert
      const comments = await commentRepositoryPostgres.findAllFromThread('thread-123')
      expect(comments).toHaveLength(2)
    })

    it('should return empty array if there is no comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })

      // Assert & Assert
      const comments = await commentRepositoryPostgres.findAllFromThread('thread-123')
      expect(comments).toEqual([])
    })
  })

  describe('findOneById function', () => {
    it('should throw NotFoundError when no comment with id found', async () => {
      // Arrange
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })

      // Action & Assert
      expect(commentRepositoryPostgres.findOneById('comment-1'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return comment when there is comment with id found', async () => {
      // Arrange
      const savedComment = new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z'
      })
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })

      // action
      await CommentsTableTestHelper.createThreadComment(SavedComment)
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
    it('should throw NotFoundError when target comment not found', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        target: 'thread-xxx',
        owner: 'user-123'
      }
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })

      // Action & Assert
      expect(commentRepositoryPostgres.remove(useCasePayload))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123'
      }
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment(useCasePayload)

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.remove({
        id: useCasePayload.id,
        threadId: useCasePayload.threadId,
        owner: 'user-xxx'
      }))
        .rejects
        .toThrowError(AuthorizationError)
    })

    it('should delete comment from database', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123'
      }

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment(useCasePayload)

      // Action
      await threadCommentRepositoryPostgres.remove(useCasePayload)

      // Assert
      const comment = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comment).toBeUndefined()
    })
  })
})
