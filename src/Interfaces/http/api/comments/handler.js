const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadCommentsHandler = this.postThreadCommentsHandler.bind(this);
  }

  async postThreadCommentsHandler(request, h) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    const { threadId } = request.params
    const addCommentThreadUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const addedCommentThread = await addCommentThreadUseCase.execute(accessToken, { target: threadId, ...request.payload });

    const response = h.response({
      status: 'success',
      data: {
        addedCommentThread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
