const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(accessToken, request.payload);
    const response = h.response({
      status: 'success',
      data: {
        addedThread :{
          title: addedThread.title,
          body: addedThread.body,
          owner: addedThread.owner,
        },
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
