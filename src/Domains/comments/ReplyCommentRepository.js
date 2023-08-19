class ReplyCommentRepository {
  async create (comment) {
    throw new Error('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async findAllFromComment (comment) {
    throw new Error('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async findOneById (id) {
    throw new Error('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async remove (comment) {
    throw new Error('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  verifyOwner (comment, userId) {
    throw new Error('REPLY_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async likeComment (userId, comment) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async unlikeComment (userId, comment) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async isUserLiked (userId, comment) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = ReplyCommentRepository
