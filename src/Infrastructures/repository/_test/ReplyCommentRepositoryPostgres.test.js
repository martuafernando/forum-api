const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const ReplyCommentRepositoryPostgres = require('../ReplyCommentRepositoryPostgres')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')

describe('ReplyCommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' })
    await ThreadsTableTestHelper.create({ id: 'thread-123' })
    await CommentsTableTestHelper.createThreadComment({
      id: 'comment-123',
      target: 'thread-123',
      owner: 'user-123'
    })
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('create function', () => {
    it('should persist new thread comment and return saved thread comment correctly', async () => {
      // Arrange
      const useCasePayload = {
        content: 'comment-content',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123'
      }
      const fakeIdGenerator = () => '234' // stub!
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator
      })

      // Action
      const savedComment = await replyCommentRepositoryPostgres.create(useCasePayload)

      // Assert
      expect(savedComment).toBeInstanceOf(SavedComment)
      expect(savedComment.content).toStrictEqual(useCasePayload.content)
      expect(savedComment.owner).toStrictEqual(useCasePayload.owner)
      expect(savedComment.is_deleted).toStrictEqual(false)

      const comments = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toEqual(useCasePayload.content)
      expect(comments.owner).toEqual(useCasePayload.owner)
      expect(savedComment.is_deleted).toStrictEqual(false)
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved comment correctly', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({
        pool
      })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-1',
        owner: 'user-123',
        target: 'comment-123'
      })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-2',
        owner: 'user-123',
        target: 'comment-123'
      })

      // Assert & Assert
      const comments = await replyCommentRepositoryPostgres.findAllFromComment('comment-123')
      expect(comments).toHaveLength(2)
      expect(comments[0].id).toStrictEqual('comment-1')
      expect(comments[1].id).toStrictEqual('comment-2')
    })

    it('should return empty array if there is no comment', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })

      // Assert & Assert
      const comments = await replyCommentRepositoryPostgres.findAllFromComment('comment-123')
      expect(comments).toEqual([])
    })
  })

  describe('findOneById function', () => {
    it('should throw NotFoundError when no comment with id found', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })

      // Action & Assert
      expect(replyCommentRepositoryPostgres.findOneById('comment-1'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return comment when there is comment with id found', async () => {
      // Arrange
      const savedComment = new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
        is_deleted: false
      })
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })

      // action
      const comments = await replyCommentRepositoryPostgres.findOneById('comment-123')

      // Assert
      expect(comments.id).toStrictEqual(savedComment.id)
      expect(comments.is_deleted).toStrictEqual(false)
      expect(comments.title).toStrictEqual(savedComment.title)
      expect(comments.content).toStrictEqual(savedComment.content)
      expect(comments.date).toStrictEqual(savedComment.date)
      expect(comments.owner).toStrictEqual(savedComment.owner)
      expect(comments.is_deleted).toStrictEqual(savedComment.is_deleted)
    })
  })

  describe('remove function', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        commentId: 'comment-123',
        userId: 'user-123'
      }
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({
        pool
      })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        target: 'comment-123',
        owner: 'user-123'
      })

      // Action & Assert
      await expect(replyCommentRepositoryPostgres.remove({
        id: useCasePayload.id,
        commentId: useCasePayload.commentId,
        userId: 'user-xxx'
      }))
        .rejects
        .toThrowError(AuthorizationError)
    })

    it('should throw NotFoundError when target comment not found', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-xxx',
        owner: 'user-123'
      }
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })

      // Action & Assert
      expect(replyCommentRepositoryPostgres.remove(useCasePayload))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should delete comment from database', async () => {
      // Arrange

      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({
        pool
      })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        target: 'comment-123',
        owner: 'user-123'
      })

      // Action
      await replyCommentRepositoryPostgres.remove({
        id: 'comment-234',
        commentId: 'comment-123',
        userId: 'user-123'
      })

      // Assert
      const replies = await CommentsTableTestHelper.findAllReplies('comment-123')
      expect(replies).toHaveLength(1)
      expect(replies[0].id).toStrictEqual('comment-234')
      expect(replies[0].is_deleted).toStrictEqual(true)

      const comment = await CommentsTableTestHelper.findOneById('comment-234')
      expect(comment).toBeUndefined()
    })
  })
})
