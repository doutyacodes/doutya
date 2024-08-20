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

const SaveQuizResult = (data, token) => {

  return axios.post(`/api/quizResult`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const InterestResult = (data) => axios.post('/api/resultTwo', data, {
  headers: {
    'Content-Type': 'application/json'
  }
})

const GetUserId=(token)=>axios.get('/api/getUserId',{
  headers: {
    Authorization: `Bearer ${token}`,
  }
});

const GetUserSequence = (data) => axios.get('/api/user-sequence',{ params: data });

const GetResults=(data)=>axios.get('/api/getResults',{ params: data });

export default {
  CreateNewUser,
  LoginUser,
  GetUser,
  GetQuizData,
  SaveQuizResult,
  InterestResult,
  GetUserSequence,
  GetUserId,
  GetResults
}