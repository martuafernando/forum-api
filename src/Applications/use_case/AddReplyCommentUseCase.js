const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const NewComment = require('../../Domains/comments/entities/NewComment')

class AddReplyCommentUseCase {
  constructor ({
    commentRepository,
    authenticationTokenManager,
    threadRepository
  }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
    this._authenticationTokenManager = authenticationTokenManager
  }

  async execute (accessToken, useCasePayload) {
    this._validatePayload(accessToken)
    const { threadId } = useCasePayload
    const { id } = await this._authenticationTokenManager.decodePayload(accessToken)
    const newComment = new NewComment({
      owner: id,
      ...useCasePayload
    })
    if (!await this._threadRepository.findOneById(threadId)) throw new NotFoundError('Thread tidak ditemukan')
    return this._commentRepository.createReplyComment(newComment)
  }

  _validatePayload (accessToken) {
    if (!accessToken) {
      throw new Error('ADD_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN')
    }

    if (typeof accessToken !== 'string') {
      throw new Error('ADD_THREAD_COMMENT_USE_CASE.ACCESS_TOKEN_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddReplyCommentUseCase
