import { templates } from '../settings.js';
//import utils from '../utils.js';

class HomePage {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
  }
  render(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    const generatedHTML = templates.homePage();
    thisHome.dom.wrapper.innerHTML = generatedHTML;

  }
}

export default HomePage;
