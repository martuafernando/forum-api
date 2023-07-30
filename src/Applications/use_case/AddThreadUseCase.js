const NewThread = require('../../Domains/threads/entities/NewThread')

class AddThreadUseCase {
  constructor ({
    threadRepository,
    userRepository
  }) {
    this._threadRepository = threadRepository
    this._userRepository = userRepository
  }

  async execute (useCasePayload) {
    const newThread = new NewThread(useCasePayload)
    await this._userRepository.findOneById(newThread.owner)
    return this._threadRepository.create(newThread)
  }
}

module.exports = AddThreadUseCase
