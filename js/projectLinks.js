// Get a NodeList of all .demo elements
const demoClasses = document.querySelectorAll('.item-wrap');

// Change the text of multiple elements with a loop
demoClasses.forEach(element => {
  element.setAttribute('onclick', "window.open('https://keetonmartin.github.io/routeCards/','mywindow');");
});

