const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const UserRepository = require('../../../Domains/users/UserRepository')
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
      owner: 'user-123'
    }
    const deleteCommentUseCase = new DeleteThreadCommentUseCase({})

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      id: 'comment-id',
      owner: 'user123'
    }
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()

    // mocking
    mockThreadCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      userRepository: mockUserRepository
    })

    // Act
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadCommentRepository.remove)
      .toHaveBeenCalledWith(useCasePayload)
  })
})
