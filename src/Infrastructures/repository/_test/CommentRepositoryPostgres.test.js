const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const pool = require('../../database/postgres/pool')
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')
const NewComment = require('../../../Domains/comments/entities/NewComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const InvariantError = require('../../../Commons/exceptions/InvariantError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' })
    await ThreadsTableTestHelper.create({ id: 'thread-123' })
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await pool.end()
  })

  describe('createThreadComment function', () => {
    it('should throw InvariantError when user not found', () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-xxx',
      })
      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        userRepository: UsersTableTestHelper,
        threadRepository: ThreadsTableTestHelper
      });
      
      // Action & Assert
      return expect(commentRepositoryPostgres.createThreadComment(newComment, 'thread-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should persist new thread comment and return saved thread comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'comment-content',
        owner: 'user-123',
      })
      const fakeIdGenerator = () => '123' // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres({
        pool,
        idGenerator: fakeIdGenerator,
        threadRepository: ThreadsTableTestHelper,
        userRepository: UsersTableTestHelper
      });

      // Action
      await commentRepositoryPostgres.createThreadComment(newComment, 'thread-123')

      // Assert
      const comments = await CommentsTableTestHelper.findOneById('comment-123');
      expect(comments).toBeInstanceOf(SavedComment);
      expect(comments.content).toEqual(newComment.content);
      expect(comments.owner).toEqual(newComment.owner);
    })
  })

  describe('findAll function', () => {
    it('should get and return all saved comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-1', owner: 'user-123' })
      await CommentsTableTestHelper.createThreadComment({ id: 'comment-2', owner: 'user-123' })

      // Assert & Assert
      const comments = await commentRepositoryPostgres.findAllFromThread('thread-123');
      expect(comments).toHaveLength(2);
    })
  })

  describe('findOneById function', () => {
    it('should return empty array when nothing comment with commentId found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })

      // Action & Assert
      const comments = await commentRepositoryPostgres.findOneById('comment-1');
      expect(comments).toBeUndefined();
    })

    it('should return comment when there is comment with commentId found', async () => {
      // Arrange
      const savedComment = new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      })
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })

      // action
      await CommentsTableTestHelper.createThreadComment(savedComment)
      const comments = await commentRepositoryPostgres.findOneById('comment-123');

      //Assert
      expect(comments).toBeInstanceOf(SavedComment)
      expect(comments.id).toEqual(savedComment.id)
      expect(comments.title).toEqual(savedComment.title)
      expect(comments.content).toEqual(savedComment.content)
      expect(comments.date).toEqual(savedComment.date)
      expect(comments.owner).toEqual(savedComment.owner)
    })
  })

  describe('remove function', () => {
    it('should throw InvariantError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })

      // Action & Assert
      expect(commentRepositoryPostgres.remove('comment-1', 'user-123'))
        .rejects
        .toThrowError(InvariantError)
    })
  })

  it('should throw AuthorizationError when user is not the owner', async () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres({
      pool,
      userRepository: UsersTableTestHelper,
      threadRepository: ThreadsTableTestHelper
    });
    await CommentsTableTestHelper.createThreadComment({ id: 'comment-123', owner: 'user-123' })

    // Action & Assert
    expect(commentRepositoryPostgres.remove('comment-123', 'user-xxx'))
      .rejects
      .toThrowError(AuthorizationError)
  })

  it('should delete comment from database', async () => {
    // Arrange
    const commentRepositoryPostgres = new CommentRepositoryPostgres({ pool })
    await CommentsTableTestHelper.createThreadComment({ id: 'comment-123', owner: 'user-123' })

    // Action
    await commentRepositoryPostgres.remove('comment-123', 'user-123')

    // Assert
    const comment = await CommentsTableTestHelper.findOneById('comment-123')
    expect(comment).toBeUndefined()
  })
})