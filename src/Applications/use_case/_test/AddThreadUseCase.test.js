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
      owner: 'user-123'
    }

    const mockSavedThread = new SavedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      date: 'thread-date',
      owner: useCasePayload.owner,
      is_deleted: false
    })

    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'Full Name'
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockUserRepository = new UserRepository()

    /** mocking needed function */
    mockThreadRepository.create = jest.fn()
      .mockResolvedValue(mockSavedThread)
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action
    const savedThread = await addThreadUseCase.execute(useCasePayload)

    // Assert
    expect(savedThread).toStrictEqual(new SavedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      date: 'thread-date',
      owner: useCasePayload.owner,
      is_deleted: false
    }))

    expect(mockUserRepository.findOneById)
      .toHaveBeenCalledWith('user-123')
    expect(mockThreadRepository.create)
      .toHaveBeenCalledWith(useCasePayload)
  })
})
