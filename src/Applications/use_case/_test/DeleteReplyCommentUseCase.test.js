const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const UserRepository = require('../../../Domains/users/UserRepository')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase')

describe('DeleteThreadCommentUseCase', () => {
  it('should throw error if use case payload not contain required attribute', async () => {
    // Arrange
    const useCasePayload = {}
    const deleteThreadCommentUseCase = new DeleteReplyCommentUseCase({})

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error if payload not meet data type spesification', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-id',
      id: 123,
      userId: 'user-123'
    }
    const deleteCommentUseCase = new DeleteReplyCommentUseCase({})

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      content: 'comment-content',
      id: 'comment-id',
      userId: 'user-123'
    }
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockthreadCommentRepository = new ThreadCommentRepository()

    const mockRegisteredUser = new RegisteredUser({
      id: useCasePayload.userId,
      username: 'username',
      fullname: 'Full Name'
    })

    const mockSavedComment = new SavedComment({
      id: useCasePayload.id,
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.userId,
      is_deleted: false
    })

    // mocking
    mockReplyCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)
    mockthreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(mockSavedComment)

    const deleteCommentUseCase = new DeleteReplyCommentUseCase({
      replyCommentRepository: mockReplyCommentRepository,
      threadCommentRepository: mockthreadCommentRepository,
      userRepository: mockUserRepository
    })

    // Act
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockReplyCommentRepository.remove)
      .toHaveBeenCalledWith(useCasePayload)
  })
})
