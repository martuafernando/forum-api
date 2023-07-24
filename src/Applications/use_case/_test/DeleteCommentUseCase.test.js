const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain required attribute', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute('access-token', useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type spesification', async () => {
    // Arrange
    const useCasePayload = {
      target: 'target-id',
      id: 123,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute('access-token', useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      target: 'thread-123',
      id: 'comment-id',
    };
    const mockCommentRepository = new CommentRepository();
    const mockauthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockCommentRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockauthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockauthenticationTokenManager,
    });

    // Act
    await deleteCommentUseCase.execute('access-token', useCasePayload);

    // Assert
    expect(mockCommentRepository.remove)
      .toHaveBeenCalledWith({
        id: useCasePayload.id,
        target: useCasePayload.target,
        owner: 'user-123'
      });
  });
});
