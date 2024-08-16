const { default: axios } = require('axios')

const CreateNewUser = (data) => axios.post('/api/user', data)
const LoginUser = (data) => axios.post('/api/login', data);
const GetUser = (token) => axios.get('/api/getUser', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const GetQuizData = (id, token) => {

  return axios.get(`/api/getQuizData/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const InterestResult = (data) => axios.post('/api/resultTwo', data, {
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  CreateNewUser,
  LoginUser,
  GetUser,
  GetQuizData,
  InterestResult
}