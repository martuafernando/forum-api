const ThreadRepository = require('../ThreadRepository')

describe('AuthenticationRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const threadRepository = new ThreadRepository()

    // Action & Assert
    await expect(threadRepository.create('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.findAll('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.findOneById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.remove('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(threadRepository.getDetailThread('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(() => threadRepository.verifyOwner('', '')).toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
