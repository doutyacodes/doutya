const {default:axios} =require('axios')

const CreateNewUser=(data)=>axios.post('/api/user',data)
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

  return axios.post(`/api/quizResult`, data,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default{
    CreateNewUser,
    LoginUser,
    GetUser,
    GetQuizData,
    SaveQuizResult
}