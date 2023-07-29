const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
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
      owner: 'user-123'
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
      id: 'comment-id',
      owner: 'user123'
    }
    const mockCommentRepository = new ReplyCommentRepository()

    // mocking
    mockCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteReplyCommentUseCase({
      replyCommentRepository: mockCommentRepository
    })

    // Act
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockCommentRepository.remove)
      .toHaveBeenCalledWith(useCasePayload)
  })
})
