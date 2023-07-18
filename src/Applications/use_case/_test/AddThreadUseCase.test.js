const NewThread = require('../../../Domains/threads/entities/NewThread');
const SavedThread = require('../../../Domains/threads/entities/SavedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'thread-title',
      body: 'thread-body',
      owner: '1',
    };

    const mockSavedThread = new SavedThread({
      id: 'thread-id',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const savedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(savedThread).toStrictEqual(new SavedThread({
      id: 'thread-id',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));

    expect(mockThreadRepository.create).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
