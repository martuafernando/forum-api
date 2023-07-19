const NewComment = require('../../../Domains/comments/entities/NewComment');
const SavedComment = require('../../../Domains/comments/entities/SavedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      owner: '1',
    };

    const mockSavedComment = new SavedComment({
      id: 'comment-id',
      content: 'comment content',
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const savedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(savedComment).toStrictEqual(new SavedComment({
      id: 'comment-id',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    expect(mockCommentRepository.create).toBeCalledWith(new NewComment({
      id: useCasePayload.id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
