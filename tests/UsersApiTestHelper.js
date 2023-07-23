const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const UserApiTestHelper = {
  async getAccessTokenFromUser({
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia'
  }) {
    const server = await createServer(container);
    
    // Add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });
    
    // Login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });

    const { data: { accessToken } } = JSON.parse(loginResponse.payload)
    return accessToken
  },

  async registerUser({
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia'
  }) {
    const server = await createServer(container);
    
    // Add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });
  }
}

module.exports = UserApiTestHelper