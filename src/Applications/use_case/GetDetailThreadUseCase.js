class GetDetailThreadUseCase {

  constructor({ threadRepository }) {
    this._threadRepository = threadRepository
  }

  async execute(useCasePayload) {
    this._verifyPayload(useCasePayload);
    const { threadId } = useCasePayload
    this._threadRepository.findOneById(threadId)
  }

  _verifyPayload(payload) {
    const { threadId } = payload;

    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetDetailThreadUseCase