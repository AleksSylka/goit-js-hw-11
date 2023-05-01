import { PixabayAPI } from "./pixabayAPI";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Report } from 'notiflix/build/notiflix-report-aio';

const pixabayAPI = new PixabayAPI();
const searchForm = document.querySelector('.search-form');
const divEl = document.querySelector('.gallery');
const btnLoadEl = document.querySelector('.load-more');
let arrayImageMarkup = [];
let currentPage;
let gallery = new SimpleLightbox('.gallery a', {captionDelay: 250,});

btnLoadEl.classList.add('is-hidden');
searchForm.addEventListener('submit', onSearchKey);

async function onSearchKey(event) {
    event.preventDefault();
    currentPage = 1;
    btnLoadEl.classList.add('is-hidden');
    const searchQuery = event.currentTarget.elements['searchQuery'].value.trim();
    pixabayAPI.query = searchQuery;
    divEl.innerHTML = '';
    if (!searchQuery) {
        btnLoadEl.classList.add('is-hidden');
        return Report.warning('Empty query!!!', 'Fill some data.')
    }

    try {
        const respons = await pixabayAPI.getPhotoByQuery(page = 1);
        if (respons.data.hits.length === 0) {
            divEl.innerHTML = '';
            btnLoadEl.classList.add('is-hidden');
            return Report.failure('Search error', 'Sorry, there are no images matching your search query. Please try again.')
        }
        
        onRenderMarkup(respons);
        gallery.refresh();

        if (respons.data.total > pixabayAPI.per_page) {
            btnLoadEl.classList.remove('is-hidden');
        }
        Report.success('Success', `Hooray! We found ${respons.data.totalHits} images.`)
    } catch(error) {
        console.log(error);
    }
}

btnLoadEl.addEventListener('click', onLoadPhoto);

async function onLoadPhoto() {
    currentPage += 1;
    btnLoadEl.classList.add('is-hidden');
    try {
        const respons = await pixabayAPI.getPhotoByQuery(currentPage);
        onRenderMarkup(respons);
        gallery.refresh();
        if (currentPage < Math.ceil(respons.data.totalHits/pixabayAPI.per_page)) {
            btnLoadEl.classList.remove('is-hidden');
        }
    } catch (err) {
        console.log(err);
    } 
}

function onRenderMarkup(respons) {
    arrayImageMarkup = respons.data.hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
            return `<a href="${largeImageURL}" class="gallery__item">
            <div class="photo-card">
                <img src="${webformatURL}" class="gallery-img" alt="${tags} loading="lazy"/>
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
            </div></a>`
        }).join("");
        divEl.insertAdjacentHTML('beforeend', arrayImageMarkup);
}