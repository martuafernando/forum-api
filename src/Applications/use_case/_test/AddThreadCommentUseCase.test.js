const NewComment = require('../../../Domains/comments/entities/NewComment');
const SavedComment = require('../../../Domains/comments/entities/SavedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');

describe('AddThreadCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      threadId: 'thread-123',
      owner: '1',
    };

    const mockSavedComment = new SavedComment({
      id: 'comment-id',
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      threadId: 'thread-123',
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.createThreadComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedComment));

    /** creating use case instance */
    const getCommentUseCase = new AddThreadCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const savedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(savedComment).toStrictEqual(new SavedComment({
      id: 'comment-id',
      content: useCasePayload.content,
      date: useCasePayload.date,
      threadId: 'thread-123',
      owner: useCasePayload.owner,
    }));

    expect(mockCommentRepository.createThreadComment).toBeCalledWith(new NewComment({
      id: useCasePayload.id,
      content: useCasePayload.content,
      threadId: 'thread-123',
      owner: useCasePayload.owner,
    }));
  });
});
