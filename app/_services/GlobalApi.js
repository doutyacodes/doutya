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

const GetCareerQuiz = (id, token) => {

  return axios.get(`/api/getPersonalityData/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


const SaveCareerQuizResult = (data, token) => {

  return axios.post(`/api/CareerQuizResult`, data, {
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

<<<<<<< HEAD
const GetUserId=(token)=>axios.get('/api/getUserId',{
  headers: {
    Authorization: `Bearer ${token}`,
  }
});

const GetUserSequence = (data) => axios.get('/api/user-sequence',{ params: data });

const GetResults=(data)=>axios.get('/api/getResults',{ params: data });
=======
>>>>>>> ca32bf4dbc31dd7bfd1559842c60f7ef661ae8d6

export default {
  CreateNewUser,
  LoginUser,
  GetUser,
  GetQuizData,
  SaveQuizResult,
  InterestResult,
<<<<<<< HEAD
  GetUserSequence,
  GetUserId,
  GetResults
=======
  GetCareerQuiz,
  SaveCareerQuizResult
>>>>>>> ca32bf4dbc31dd7bfd1559842c60f7ef661ae8d6
}