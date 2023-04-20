import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.wrapper = element;
    // const generatedHTML = templates.menuProduct(thisProduct.data);
    // thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // const menuContainer = document.querySelector(select.containerOf.menu);
    // menuContainer.appendChild(thisProduct.element);
    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.wrapper.appendChild(thisBooking.element);

    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidgets() {
    const thisBooking = this;
    //thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    // thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    // thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    // thisCartProduct.dom.amountWidget.addEventListener('updated', () => thisCartProduct.processOrderInCart());
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
export default Booking;
