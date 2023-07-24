const NewThread = require('../../../Domains/threads/entities/NewThread')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'thread-title',
      body: 'thread-body',
      owner: '1'
    }

    const mockSavedThread = new SavedThread({
      id: 'thread-id',
      title: useCasePayload.title,
      body: useCasePayload.body,
      date: 'thread-date',
      owner: useCasePayload.owner
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockauthenticationTokenManager = new AuthenticationTokenManager()

    /** mocking needed function */
    mockThreadRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedThread))
    mockauthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }))

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockauthenticationTokenManager
    })

    // Action
    const savedThread = await addThreadUseCase.execute('example-token-access', useCasePayload)

    // Assert
    expect(savedThread).toStrictEqual(new SavedThread(mockSavedThread))

    expect(mockThreadRepository.create).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner
    }))
  })
})
