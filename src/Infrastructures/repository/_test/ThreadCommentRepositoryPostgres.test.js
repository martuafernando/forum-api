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
      const savedComment = await commentRepositoryPostgres.create(newThreadComment)

      // Assert
      expect(savedComment).toBeInstanceOf(SavedComment)
      expect(savedComment.content).toStrictEqual('comment-content')
      expect(savedComment.owner).toStrictEqual('user-123')

      const comments = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.content).toStrictEqual('comment-content')
      expect(comments.owner).toStrictEqual('user-123')
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'thread-123',
        owner: 'user-123',
        is_deleted: false
      })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-124',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'thread-123',
        owner: 'user-123',
        is_deleted: false
      })

      // Assert & Assert
      const comments = await commentRepositoryPostgres.findAllFromThread('thread-123')
      expect(comments).toHaveLength(2)
      expect(comments[0].id).toStrictEqual('comment-123')
      expect(comments[1].id).toStrictEqual('comment-124')
      expect(comments).toEqual([
        {
          id: 'comment-123',
          content: 'comment-content',
          date: '2021-08-08T07:19:09.775Z',
          owner: 'user-123',
          likeCount: 0,
          is_deleted: false
        },
        {
          id: 'comment-124',
          content: 'comment-content',
          date: '2021-08-08T07:19:09.775Z',
          owner: 'user-123',
          likeCount: 0,
          is_deleted: false
        }
      ])
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
        date: '2021-08-08T07:19:09.775Z',
        is_deleted: false,
        likeCount: 0,
      })
      const commentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })

      // action
      await CommentsTableTestHelper.createThreadComment(savedComment)
      const comments = await commentRepositoryPostgres.findOneById('comment-123')

      // Assert
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.id).toEqual('comment-123')
      expect(comments.content).toEqual('comment-content')
      expect(comments.date).toEqual('2021-08-08T07:19:09.775Z')
      expect(comments.owner).toEqual('user-123')
      expect(comments.is_deleted).toEqual(false)
    })
  })

  describe('remove function', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const useCasePayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123'
      }

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment(useCasePayload)

      // Action
      await threadCommentRepositoryPostgres.remove(useCasePayload.id)

      // Assert
      const threads = await CommentsTableTestHelper.findAll()
      expect(threads).toHaveLength(1)
      expect(threads[0].id).toStrictEqual('comment-123')
      expect(threads[0].is_deleted).toStrictEqual(true)

      const comment = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comment).toBeUndefined()
    })
  })

  describe('likeComment function', () => {
    it('Should increase the likeCount if the commented was liked', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'thread-123',
        owner: 'user-123'
      })

      // Action & Assert
      await threadRepositoryPostgres.likeComment('user-123', 'comment-123')
      const comment = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comment).toEqual(new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 1,
      }))
    })
  })

  describe('unlikeComment function', () => {
    it('Should increase the likeCount if the commented was liked', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'thread-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.setCommentLike('comment-123', '1')

      // Action & Assert
      await threadRepositoryPostgres.unlikeComment('user-123', 'comment-123')
      const comment = await CommentsTableTestHelper.findOneById('comment-123')
      expect(comment).toEqual(new SavedComment({
        id: 'comment-123',
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
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createReplyComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        target: 'thread-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.setUserLikeComment('user-123', 'comment-234', '1')

      // Action & Assert
      expect(threadCommentRepositoryPostgres.isUserLiked('user-123', 'comment-234'))
        .resolves
        .toBe(true)
    })

    it('Should return false if user was not like the comment', async () => {
      // Arrange
      const replyCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
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

  describe('verifyyOwner function', () => {
    it('Should return Authorization Error if the user is not the comment owner', async () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      const savedThreadComment = new SavedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'comment content',
        date: '2021-08-08T07:19:09.775Z',
        likeCount: 0,
        is_deleted: false
      })

      // Action & Assert
      await expect(() => threadCommentRepositoryPostgres.verifyOwner(savedThreadComment, 'user-xxx'))
        .toThrowError(AuthorizationError)
    })

    it('Should return true if the user is the comment owner', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadCommentRepositoryPostgres({ pool })
      const savedThreadComment = new SavedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'comment content',
        date: '2021-08-08T07:19:09.775Z',
        likeCount: 0,
        is_deleted: false
      })

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyOwner(savedThreadComment, 'user-123'))
        .toStrictEqual(true)
    })
  })
})
