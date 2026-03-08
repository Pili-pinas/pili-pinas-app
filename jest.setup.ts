import "@testing-library/jest-dom";

// jsdom doesn't implement scrollIntoView
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = function () {};
}
