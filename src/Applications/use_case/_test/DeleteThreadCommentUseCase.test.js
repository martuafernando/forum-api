const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const UserRepository = require('../../../Domains/users/UserRepository')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase')

describe('DeleteThreadCommentUseCase', () => {
  it('should throw error if use case payload not contain required attribute', async () => {
    // Arrange
    const useCasePayload = {}
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({})

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error if payload not meet data type spesification', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'target-id',
      id: 123,
      userId: 'user-123'
    }
    const deleteCommentUseCase = new DeleteThreadCommentUseCase({})

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should throw Authorization error if user is not the owner', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      id: 'comment-id',
      userId: 'user123'
    }
    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'Full Name'
    })
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()

    // mocking
    mockThreadCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => {
        throw new AuthorizationError('Forbidden')
      })
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue()

    const deleteCommentUseCase = new DeleteThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError(AuthorizationError)
  })

  it('should throw NotFound error if the thread comment is not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      id: 'comment-id',
      userId: 'user123'
    }
    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'Full Name'
    })
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()

    // mocking
    mockThreadCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockImplementation(() => {
        throw new NotFoundError('Comment tidak ditemukan')
      })
    mockThreadCommentRepository.verifyOwner = () => true
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue()

    const deleteCommentUseCase = new DeleteThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError(NotFoundError)
  })

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      id: 'comment-id',
      userId: 'user-123'
    }

    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()

    // mocking
    mockThreadCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false
      }))
    mockThreadCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => true)
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(new RegisteredUser({
        id: 'user-123',
        username: 'username',
        fullname: 'Full Name'
      }))
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue()

    const deleteCommentUseCase = new DeleteThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadCommentRepository.remove)
      .toHaveBeenCalledWith('comment-id')
    expect(mockThreadCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-id')
    expect(mockThreadCommentRepository.verifyOwner)
      .toHaveBeenCalledWith(new SavedComment({
        id: 'comment-123',
        content: 'comment-content',
        date: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
        is_deleted: false
      }), 'user-123')
    expect(mockUserRepository.findOneById)
      .toHaveBeenCalledWith('user-123')
    expect(mockThreadRepository.findOneById)
      .toHaveBeenCalledWith('thread-123')
  })
})
