class DeleteCommentUseCase {
  constructor ({
    commentRepository,
    authenticationTokenManager
  }) {
    this._commentRepository = commentRepository
    this._authenticationTokenManager = authenticationTokenManager
  }

  async execute (accessToken, useCasePayload) {
    this._validatePayload(accessToken, useCasePayload)
    const { id } = await this._authenticationTokenManager.decodePayload(accessToken)
    return this._commentRepository.remove({
      ...useCasePayload,
      owner: id
    })
  }

  _validatePayload (accessToken, payload) {
    const { target, id } = payload
    if (!accessToken) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN')
    }

    if (!target || !id) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof accessToken !== 'string' || typeof target !== 'string' || typeof id !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = DeleteCommentUseCase
