const {default:axios} =require('axios')

const CreateNewUser=(data)=>axios.post('/api/user',data)
const LoginUser = (data) => axios.post('/api/login', data);
const GetUser = (token) => axios.get('/api/getUser', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

export default{
    CreateNewUser,
    LoginUser,
    GetUser
}