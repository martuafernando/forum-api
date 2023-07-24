const NewThread = require('../../Domains/threads/entities/NewThread')

class AddThreadUseCase {
  constructor ({
    threadRepository,
    authenticationTokenManager
  }) {
    this._threadRepository = threadRepository
    this._authenticationTokenManager = authenticationTokenManager
  }

  async execute (accessToken, useCasePayload) {
    this._validatePayload(accessToken)
    const { id } = await this._authenticationTokenManager.decodePayload(accessToken)
    const newThread = new NewThread({
      owner: id,
      ...useCasePayload
    })
    return this._threadRepository.create(newThread)
  }

  _validatePayload (accessToken) {
    if (!accessToken) {
      throw new Error('ADD_THREAD_USE_CASE.NOT_CONTAIN_ACCESS_TOKEN')
    }

    if (typeof accessToken !== 'string') {
      throw new Error('ADD_THREAD_USE_CASE.ACCESS_TOKEN_NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = AddThreadUseCase
