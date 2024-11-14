import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { searchImages } from './js/pixabay-api.js';
import {
  renderGallery,
  toggleLoadMoreButton,
  showLoader,
  showToastMessage,
} from './js/render-functions.js';

let currentPage = 1;
let currentQuery = '';
let lightbox = null;
let totalHits = 0;
let currentImages = 0;
const gallery = document.querySelector('.gallery');

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.search-form');
  const loadMoreBtn = document.querySelector('.load-more');

  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });

  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const searchQuery = e.target.elements.searchQuery.value.trim();

    resetGallery();

    if (!searchQuery) {
      iziToast.error({
        title: 'Error',
        message: 'Please enter a search query.',
        position: 'topRight',
        timeout: 3000,
      });
      return;
    }

    currentQuery = searchQuery;
    currentPage = 1;
    currentImages = 0;

    try {
      showLoader(true);
      toggleLoadMoreButton(false);
      showToastMessage(false);

      const data = await searchImages(searchQuery, currentPage);
      totalHits = data.totalHits;
      currentImages = data.hits.length;

      if (data.hits.length === 0) {
        iziToast.warning({
          title: 'No Results',
          message:
            'Sorry, there are no images matching your search query. Please try again.',
          position: 'topRight',
          timeout: 3000,
        });
        return;
      }

      renderGallery(data.hits, gallery);
      lightbox.refresh();

      if (currentImages >= totalHits) {
        showToastMessage(true);
      } else {
        toggleLoadMoreButton(true);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      iziToast.error({
        title: 'Error',
        message: 'An error occurred while fetching images. Please try again.',
        position: 'topRight',
        timeout: 3000,
      });
    } finally {
      showLoader(false);
    }
  });

  loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;

    try {
      showLoader(true);
      toggleLoadMoreButton(false);

      const data = await searchImages(currentQuery, currentPage);
      currentImages += data.hits.length;

      renderGallery(data.hits, gallery, true);
      lightbox.refresh();

      const { height: cardHeight } =
        gallery.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      if (currentImages >= totalHits) {
        showToastMessage(true);
      } else {
        toggleLoadMoreButton(true);
      }
    } catch (error) {
      console.error('Error fetching more images:', error);
      iziToast.error({
        title: 'Error',
        message:
          'An error occurred while fetching more images. Please try again.',
        position: 'topRight',
        timeout: 3000,
      });
      resetGallery();
    } finally {
      showLoader(false);
    }
  });
});

function resetGallery() {
  currentQuery = '';
  gallery.innerHTML = '';
}