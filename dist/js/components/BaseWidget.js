class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;

    let newValue = thisWidget.parseValue(value);
    /*validation*/
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    //thisWidget.dom.input.value = thisWidget.correctValue;
    thisWidget.renderValue();
  }
  setValue(value) {
    const thisWidget = this;
    thisWidget.value = value;
  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    //thisWidget.minValue = settings.amountWidget.defaultMin;
    //thisWidget.maxValue = settings.amountWidget.defaultMax;

    return !isNaN(value);
  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true,
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
export default BaseWidget;
