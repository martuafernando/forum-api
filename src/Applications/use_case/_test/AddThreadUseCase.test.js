const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const UserRepository = require('../../../Domains/users/UserRepository')
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

    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'FullName'
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockUserRepository = new UserRepository()

    /** mocking needed function */
    mockThreadRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedThread))
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredUser))

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action
    const savedThread = await addThreadUseCase.execute(useCasePayload)

    // Assert
    expect(savedThread).toStrictEqual(new SavedThread(mockSavedThread))

    expect(mockThreadRepository.create).toBeCalledWith(useCasePayload)
  })
})
