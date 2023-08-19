const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const UserRepository = require('../../../Domains/users/UserRepository')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const LikeReplyCommentUseCase = require('../LikeAndUnlikeReplyCommentUseCase')

describe('LikeAndUnlikeReplyCommentUseCase', () => {
  it('should throw error if use case payload not contain required attribute', async () => {
    // Arrange
    const useCasePayload = {}
    const likeReplyCommentUseCase = new LikeReplyCommentUseCase({})

    // Action & Assert
    await expect(likeReplyCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_REPLY_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error if use case payload not contain required attribute', async () => {
    // Arrange
    const likeReplyCommentUseCase = new LikeReplyCommentUseCase({})

    // Action & Assert
    await expect(likeReplyCommentUseCase.execute({
      threadId: 'thread-123',
      commentId: 123,
      replyId: 'comment-234',
      userId: 'user-123'
    }))
      .rejects
      .toThrowError('LIKE_REPLY_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'comment-234',
      userId: 'user-123'
    }

    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()
    // mocking
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 0
      }))
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(new RegisteredUser({
        id: 'user-123',
        username: 'username',
        fullname: 'Full Name'
      }))
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedThread({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        date: 'thread-date',
        owner: 'thread-owner',
        is_deleted: false
      }))
    mockReplyCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 0
      }))
    mockReplyCommentRepository.isUserLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false))
    mockReplyCommentRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const likeCommentUseCase = new LikeReplyCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadRepository: mockThreadRepository,
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    await likeCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-123')
    expect(mockReplyCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-234')
    expect(mockUserRepository.findOneById)
      .toHaveBeenCalledWith('user-123')
    expect(mockThreadRepository.findOneById)
      .toHaveBeenCalledWith('thread-123')
    expect(mockReplyCommentRepository.isUserLiked)
      .toHaveBeenCalledWith('user-123', 'comment-234')
    expect(mockReplyCommentRepository.likeComment)
      .toHaveBeenCalledWith('user-123', 'comment-234')
  })

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'comment-234',
      userId: 'user-123'
    }

    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()
    // mocking
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 0
      }))
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(new RegisteredUser({
        id: 'user-123',
        username: 'username',
        fullname: 'Full Name'
      }))
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedThread({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        date: 'thread-date',
        owner: 'thread-owner',
        is_deleted: false
      }))
    mockReplyCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedComment({
        id: 'comment-234',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false,
        likeCount: 0
      }))
    mockReplyCommentRepository.isUserLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true))
    mockReplyCommentRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const likeCommentUseCase = new LikeReplyCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadRepository: mockThreadRepository,
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    await likeCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-123')
    expect(mockReplyCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-234')
    expect(mockUserRepository.findOneById)
      .toHaveBeenCalledWith('user-123')
    expect(mockThreadRepository.findOneById)
      .toHaveBeenCalledWith('thread-123')
    expect(mockReplyCommentRepository.isUserLiked)
      .toHaveBeenCalledWith('user-123', 'comment-234')
    expect(mockReplyCommentRepository.unlikeComment)
      .toHaveBeenCalledWith('user-123', 'comment-234')
  })
})
