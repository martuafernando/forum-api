const GetDetailThreadUseCase = require('../GetDetailThreadUseCase')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const UserRepository = require('../../../Domains/users/UserRepository')

describe('GetDetailThreadUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    // Arrange
    const useCasePayload = {}
    const getDetailThreadUseCase = new GetDetailThreadUseCase({})

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID')
  })

  it('should throw error if threadId not string', async () => {
    // Arrange
    const useCasePayload = {
      id: 1
    }
    const getDetailThreadUseCase = new GetDetailThreadUseCase({})

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-id'
    }
    const savedThread = {
      id: 'thread-123',
      title: 'thread-123 title',
      body: 'thread-123 body',
      date: 'thread-123-date',
      owner: 'user-123'
    }
    const savedComments = [
      {
        id: 'comment-1',
        content: 'comment-1 content',
        date: 'comment-1-date',
        owner: 'user-123'
      },
      {
        id: 'comment-2',
        content: 'comment-2 content',
        date: 'comment-2-date',
        owner: 'user-234'
      }
    ]
    const registeredUser = {
      id: 'user-123',
      username: 'dicoding',
      fullname: 'Dicoding Indonesia'
    }
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockUserRepository = new UserRepository()

    // Mocking
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(savedThread))
    mockCommentRepository.findAllFromTarget = jest.fn()
      .mockImplementation(() => Promise.resolve(savedComments))
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(registeredUser))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload)
    // Assert
    expect(thread.username).toBeDefined()
    expect(thread.comments).toBeDefined()
    expect(thread.username).toBeDefined()

    expect(mockThreadRepository.findOneById)
      .toBeCalledWith(useCasePayload.id)
    expect(mockCommentRepository.findAllFromTarget)
      .toBeCalledWith(useCasePayload.id)
    expect(mockUserRepository.findOneById)
      .toBeCalledWith(registeredUser.id)
  })
})
