import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const communityService = {
  async getCommunities(careerId) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`api/communities?careerId=${careerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch communities', error);
      throw error;
    }
  },

  async getCommunityPosts(communityId) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`api/communities/${communityId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch community posts', error);
      throw error;
    }
  },

  async createPost(postData) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`api/posts`, postData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create post', error);
      throw error;
    }
  }
};