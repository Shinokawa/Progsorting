import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const getEvents = () => axios.get(`${API_BASE}/events`);
export const reorderEvents = (order) => axios.post(`${API_BASE}/reorder`, order);
export const updateEvent = (id, data) => axios.post(`${API_BASE}/update`, { id, ...data });
export const updateStartTime = (morning_start, afternoon_start) =>
  axios.post(`${API_BASE}/updatestarttime`, { morning_start, afternoon_start });