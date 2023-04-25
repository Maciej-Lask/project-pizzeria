import { settings, select, templates, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.starters = [];
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }
  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    //console.log('params :>> ', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };

    //console.log('urls :>> ', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),

          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;

    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    thisBooking.dom.tables.forEach(function (table) {
      table.classList.remove(classNames.booking.tableNowBooking);
    });
  }
  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.wrapper = element;

    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.wrapper.appendChild(thisBooking.element);

    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.floorPlan = document.querySelector(select.booking.floorPlan);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    thisBooking.dom.starters = document.querySelector(select.booking.starters);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidgetPeople = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.amountWidgetHours = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.starters.addEventListener('click', function (event) {
      const clickedElement = event.target;

      const tagName = clickedElement.tagName;
      const typeAttribute = clickedElement.getAttribute('type');
      const nameAttribute = clickedElement.getAttribute('name');

      if (
        tagName == 'INPUT' &&
        typeAttribute == 'checkbox' &&
        nameAttribute == 'starter'
      ) {
        if (clickedElement.checked) {
          thisBooking.starters.push(clickedElement.value);
        } else {
          thisBooking.starters.splice(
            thisBooking.starters.indexOf(clickedElement.value),
            1
          );
        }
      }
    });

    thisBooking.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
  initTables(event) {
    const thisBooking = this;
    event.preventDefault();

    const clickedElement = event.target;
    if (clickedElement.classList.contains(classNames.booking.table)) {
      const tableId = clickedElement.getAttribute(
        settings.booking.tableIdAttribute
      );
      //toggle class nowBooking
      if (
        !clickedElement.classList.contains(
          classNames.booking.tableNowBooking
        ) &&
        !clickedElement.classList.contains(classNames.booking.tableBooked)
      ) {
        //remove class nowBooking from all tables
        thisBooking.dom.tables.forEach(function (table) {
          table.classList.remove(classNames.booking.tableNowBooking);
        });
        clickedElement.classList.add(classNames.booking.tableNowBooking);
        thisBooking.selectedTable = tableId;
        //console.log(thisBooking.selectedTable);
      } else if (
        clickedElement.classList.contains(classNames.booking.tableBooked)
      ) {
        alert('Table is booked');
        thisBooking.dom.tables.forEach(function (table) {
          table.classList.remove(classNames.booking.tableNowBooking);
        });
      } else {
        thisBooking.dom.tables.forEach(function (table) {
          table.classList.remove(classNames.booking.tableNowBooking);
        });
      }
    }
  }
  initActions() {
    const thisBooking = this;
    thisBooking.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });
    //order
    thisBooking.submitButton = document.querySelector(
      select.booking.submitButton
    );
    thisBooking.submitButton.addEventListener('click', function (event) {
      thisBooking.sendBooking(event);
    });
  }
  sendBooking(event) {
    const thisBooking = this;
    event.preventDefault();
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selectedTable),
      duration: thisBooking.amountWidgetHours.value,
      ppl: thisBooking.amountWidgetPeople.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: thisBooking.starters,
    };

    thisBooking.makeBooked(
      payload.date,
      payload.hour,
      payload.duration,
      payload.table
    );
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        if (response.ok) {
          // remove class tableNowBooking from all tables
          thisBooking.dom.tables.forEach(function (table) {
            table.classList.remove(classNames.booking.tableNowBooking);
          });

          // add class tableBooked to the booked table
          thisBooking.booked[thisBooking.date][thisBooking.hour].push(
            parseInt(thisBooking.selectedTable)
          );
          thisBooking.selectedTable = 0;
          thisBooking.updateDOM();
        } else {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });

    console.log('payload', payload);

  }
}
export default Booking;
