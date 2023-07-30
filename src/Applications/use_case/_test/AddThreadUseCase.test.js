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

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockUserRepository = new UserRepository()

    /** mocking needed function */
    mockThreadRepository.create = async () => {
      return {
        id: 'thread-id',
        title: useCasePayload.title,
        body: useCasePayload.body,
        date: 'thread-date',
        owner: useCasePayload.owner
      }
    }
    mockUserRepository.findOneById = async () => {
      return {
        id: 'user-123',
        username: 'username',
        fullname: 'FullName'
      }
    }

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository
    })

    // Action
    const savedThread = await addThreadUseCase.execute(useCasePayload)

    // Assert
    expect(savedThread).toStrictEqual({
      id: 'thread-id',
      title: useCasePayload.title,
      body: useCasePayload.body,
      date: 'thread-date',
      owner: useCasePayload.owner
    })
  })
})
