const GetDetailThreadUseCase = require("../GetDetailThreadUseCase");
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetDetailThreadUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    // Arrange
    const useCasePayload = {};
    const getDetailThreadUseCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if threadId not string', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 1,
    };
    const getDetailThreadUseCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-id',
    };
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    })

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload)

    // Assert
    expect(mockThreadRepository.findOneById)
      .toBeCalledWith(useCasePayload.threadId);
  });
})