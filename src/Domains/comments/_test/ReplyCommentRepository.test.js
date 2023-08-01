const ReplyCommentRepository = require('../ReplyCommentRepository')

describe('ReplyCommentsRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const commentRepository = new ReplyCommentRepository()

    // Action & Assert
    await expect(commentRepository.create('')).rejects.toThrowError('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.findAllFromComment('')).rejects.toThrowError('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.findOneById('')).rejects.toThrowError('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(commentRepository.remove('')).rejects.toThrowError('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(() => commentRepository.verifyOwner('', '')).toThrowError('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
