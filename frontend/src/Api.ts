import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const getTasks = async (token: string) =>
  axios.get(`${API_URL}/tasks`, { headers: { Authorization: token } });

export const createTask = async (token: string, task: { title: string, description: string }) =>
  axios.post(`${API_URL}/tasks`, task, { headers: { Authorization: token } });

export const deleteTask = async (token: string, id: number) =>
  axios.delete(`${API_URL}/tasks/${id}`, { headers: { Authorization: token } });
