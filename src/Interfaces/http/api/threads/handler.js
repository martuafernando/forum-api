const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(accessToken, request.payload);
    const response = h.response({
      status: 'success',
      data: {
        addedThread :{
          id: addedThread.id,
          title: addedThread.title,
          owner: addedThread.owner,
        },
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);
    const { threadId: id } = request.params
    const thread = await getDetailThreadUseCase.execute({ id });

    const response = h.response({
      status: 'success',
      data: {
        thread
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
