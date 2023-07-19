const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain comment Id', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
  });

  it('should throw error if refresh token not string', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-id',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.remove)
      .toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
