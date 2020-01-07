import axios from 'axios';

export default class RPC {
  static async fetchBalance() {
    const response = await axios('http://127.0.0.1:8232/', {
      data: {
        jsonrpc: '2.0',
        id: 'curltest',
        method: 'z_gettotalbalance',
        params: [0]
      },
      method: 'POST',
      auth: {
        username: 'adityapk',
        password: 'password'
      }
    });

    return response.data.result;
  }
}
