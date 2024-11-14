import axios from 'axios';

const API_KEY = '46842310-1eff6901abe3b896058131b9e';
const BASE_URL = 'https://pixabay.com/api/';

export async function searchImages(searchQuery, page = 1) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 15,
    page,
  });

  const response = await axios.get(`${BASE_URL}?${searchParams}`);
  return response.data;
}