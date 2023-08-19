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
        commentId: 'comment-123',
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
      expect(savedComment.content).toStrictEqual('comment-content')
      expect(savedComment.owner).toStrictEqual('user-123')
      expect(savedComment.is_deleted).toStrictEqual(false)

      const comments = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toEqual('comment-content')
      expect(comments.owner).toEqual('user-123')
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
        id: 'comment-223',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123',
        is_deleted: false
      })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-224',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123',
        is_deleted: false
      })

      // Assert & Assert
      const comments = await replyCommentRepositoryPostgres.findAllFromComment('comment-123')
      expect(comments).toHaveLength(2)
      expect(comments[0].id).toStrictEqual('comment-223')
      expect(comments[1].id).toStrictEqual('comment-224')
      expect(comments).toEqual([
        {
          id: 'comment-223',
          content: 'comment-content',
          date: '2021-08-08T07:19:09.775Z',
          owner: 'user-123',
          is_deleted: false
        },
        {
          id: 'comment-224',
          content: 'comment-content',
          date: '2021-08-08T07:19:09.775Z',
          owner: 'user-123',
          is_deleted: false
        }
      ])
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
        id: 'comment-124',
        content: 'comment-content',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
        likeCount: 0,
        is_deleted: false
      })
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment(savedComment)
      // action
      const comments = await replyCommentRepositoryPostgres.findOneById('comment-124')

      // Assert
      expect(comments.id).toStrictEqual('comment-124')
      expect(comments.is_deleted).toStrictEqual(false)
      expect(comments.content).toStrictEqual('comment-content')
      expect(comments.date).toStrictEqual('2021-08-08T07:19:09.775Z')
      expect(comments.owner).toStrictEqual('user-123')
      expect(comments.is_deleted).toStrictEqual(false)
    })
  })

  describe('likeComment function', () => {
    it('Should increase the likeCount if the commented was liked', async () => {
      // Arrange
      const threadRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123'
      })

      // Action & Assert
      await threadRepositoryPostgres.likeComment('user-123', 'comment-234')
      const comment = await CommentsTableTestHelper.findOneById('comment-234')
      expect(comment).toEqual(new SavedComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 1,
      }))
    })
  })

  describe('unlikeComment function', () => {
    it('Should decrease the likeCount if the commented was liked', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.setCommentLike('comment-234', '1')

      // Action & Assert
      await replyCommentRepositoryPostgres.unlikeComment('user-123', 'comment-234')
      const comment = await CommentsTableTestHelper.findOneById('comment-234')
      expect(comment).toEqual(new SavedComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 0,
      }))
    })
  })

  describe('isUserLiked function', () => {
    it('Should return true if user was like the comment', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.setUserLikeComment('user-123', 'comment-234', '1')

      // Action & Assert
      expect(replyCommentRepositoryPostgres.isUserLiked('user-123', 'comment-234'))
        .resolves
        .toBe(true)
    })

    it('Should return false if user was not like the comment', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'comment-123',
        owner: 'user-123'
      })

      // Action & Assert
      expect(replyCommentRepositoryPostgres.isUserLiked('user-123', 'comment-234'))
        .resolves
        .toBe(false)
    })
  })

  describe('remove function', () => {
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
      await replyCommentRepositoryPostgres.remove('comment-234')

      // Assert
      const replies = await CommentsTableTestHelper.findAllReplies('comment-123')
      expect(replies).toHaveLength(1)
      expect(replies[0].id).toStrictEqual('comment-234')
      expect(replies[0].is_deleted).toStrictEqual(true)

      const comment = await CommentsTableTestHelper.findOneById('comment-234')
      expect(comment).toBeUndefined()
    })
  })

  describe('verifyyOwner function', () => {
    it('Should return Authorization Error if the user is not the comment owner', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      const savedReplyComment = new SavedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'comment content',
        date: '2021-08-08T07:19:09.775Z',
        likeCount: 0,
        is_deleted: false
      })

      // Action & Assert
      expect(() => replyCommentRepositoryPostgres.verifyOwner(savedReplyComment, 'user-xxx'))
        .toThrowError(AuthorizationError)
    })

    it('Should return true if the user is the comment owner', async () => {
      // Arrange
      const threadRepositoryPostgres = new ReplyCommentRepositoryPostgres({ pool })
      const savedReplyComment = new SavedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'comment content',
        date: '2021-08-08T07:19:09.775Z',
        likeCount: 0,
        is_deleted: false
      })

      // Action & Assert
      expect(threadRepositoryPostgres.verifyOwner(savedReplyComment, 'user-123'))
        .toStrictEqual(true)
    })
  })
})
