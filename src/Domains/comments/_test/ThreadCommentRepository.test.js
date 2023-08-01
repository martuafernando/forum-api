const ThreadCommentRepository = require('../ThreadCommentRepository')

describe('ThreadCommentsRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const commentRepository = new ThreadCommentRepository()

    // Action & Assert
    await expect(commentRepository.create('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.findAllFromThread('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.findOneById('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.remove('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(() => commentRepository.verifyOwner('', '')).toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
