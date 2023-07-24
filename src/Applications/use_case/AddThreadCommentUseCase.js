const NewComment = require('../../Domains/comments/entities/NewComment')

class AddThreadCommentUseCase {
  constructor ({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository
    this._authenticationTokenManager = authenticationTokenManager
  }

  async execute (accessToken, useCasePayload) {
    this._validatePayload(accessToken)
    const { id } = await this._authenticationTokenManager.decodePayload(accessToken)
    const newComment = new NewComment({
      owner: id,
      ...useCasePayload
    })
    return this._commentRepository.createThreadComment(newComment)
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

module.exports = AddThreadCommentUseCase
