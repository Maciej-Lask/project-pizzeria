import { settings, select, classNames } from './settings.js';

import HomePage from './components/Home.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';  
const app = {
  initBooking: function () {
    const thisApp = this;
    const bookingElem = document.querySelector(select.containerOf.booking);
    //create a new instance of the Booking class and pass the container we just found to the constructor
    thisApp.booking = new Booking(bookingElem);
    //console.log('thisApp.booking :>> ', thisApp.booking);
  },
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        // get page id from href attribute of clicked element
        
        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);
        //change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    //add class 'active' to matching page and remove class 'active' from other pages
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      //add class 'active' to matching link and remove class 'active' from other links
      for (let link of thisApp.navLinks) {
        link.classList.toggle(
          classNames.nav.active,
          link.getAttribute('href') == '#' + pageId
        );
      }
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        //save parsed response as thisApp.data.products
        thisApp.data.products = parsedResponse;
        //execute initMenu method
        thisApp.initMenu();
      });
  },
  initHomePage: function () {
    const thisApp = this;
    const homePageElem = document.querySelector(select.containerOf.homePage);
    thisApp.homePage = new HomePage(homePageElem);
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initHomePage();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
