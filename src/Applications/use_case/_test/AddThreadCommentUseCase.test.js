const NewThread = require('../../../Domains/threadComments/entities/NewThreadComment');
const SavedThread = require('../../../Domains/threadComments/entities/SavedThreadComment');
const ThreadCommentRepository = require('../../../Domains/threadComments/ThreadCommentRepository');
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');

describe('AddThreadCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      owner: '1',
    };

    const mockSavedThread = new SavedThread({
      id: 'thread-comment-id',
      content: 'comment content',
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadCommentRepository = new ThreadCommentRepository();

    /** mocking needed function */
    mockThreadCommentRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedThread));

    /** creating use case instance */
    const getThreadCommentUseCase = new AddThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const savedThreadComment = await getThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(savedThreadComment).toStrictEqual(new SavedThread({
      id: 'thread-comment-id',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    expect(mockThreadCommentRepository.create).toBeCalledWith(new NewThread({
      id: useCasePayload.id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
