import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API = 'https://pixabay.com/api/';
const KEY = '14059881-4edac1c6036b12acbb9b58250';

let page = 1;
const per_page = 40;
let value = '';

const form = document.querySelector('#search-form');
const input = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const lastChild = document.querySelector('.js-guard');
const galLink = new SimpleLightbox('.gallery a');
const option = {
  rootMargin: '200px',
};
const observer = new IntersectionObserver(onPagination, option);

form.addEventListener('submit', submitForm);

function submitForm(e) {
  e.preventDefault();
  if (input.value.trim()) {
    gallery.innerHTML = '';
    page = 1;
    value = input.value.trim();
    observer.unobserve(lastChild);
    getData(value, page);
  } else {
    Notiflix.Notify.failure('The field cannot be empty.');
  }
}

async function getData(value, page) {
  const option = {
    params: {
      key: KEY,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page,
      per_page,
    },
  };

  try {
    const response = await axios.get(API, option);
    console.log(response);
    if (!response.data.totalHits) {
      console.log(123);
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      createImage(response.data.hits);
      galLink.refresh();

      if (page === 1) {
        Notiflix.Notify.info(
          `Hooray! We found ${response.data.totalHits} images.`
        );
      } else {
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      }

      if (per_page * page >= response.data.totalHits) {
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        observer.unobserve(lastChild);
      } else {
        observer.observe(lastChild);
      }
    }
  } catch (error) {
    console.error(error);
    observer.unobserve(lastChild);
    Notiflix.Notify.failure(
      'Sorry, some error on the server. Please try again.'
    );
  }
}

function createImage(res) {
  const mass = res
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="photo-card">
  <a href='${largeImageURL}'><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</li>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', mass);
}

function onPagination(entries) {
  entries.forEach(el => {
    if (el.isIntersecting) {
      page += 1;
      getData(value, page);
    }
  });
}
