var cards = document.querySelectorAll('.box');

//  Meta icon changing

function isDayTime() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18);  // Consider day time from 6 AM to 6 PM
}

function changeFaviconAndIcons() {
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  const favicon32 = document.querySelector('link[sizes="32x32"]');
  const favicon16 = document.querySelector('link[sizes="16x16"]');

  if (isDayTime()) {
    // Set the day icons
    appleTouchIcon.setAttribute('href', '/static/images/day-apple-touch-icon.png');
    favicon32.setAttribute('href', '/static/images/day-favicon-32x32.png');
    favicon16.setAttribute('href', '/static/images/day-favicon-16x16.png');
  } else {
    // Set the night icons
    appleTouchIcon.setAttribute('href', '/static/images/night-apple-touch-icon.png');
    favicon32.setAttribute('href', '/static/images/night-favicon-32x32.png');
    favicon16.setAttribute('href', '/static/images/night-favicon-16x16.png');
  }
}

// Call the function to change the favicon and icons when the page loads
document.addEventListener("DOMContentLoaded", changeFaviconAndIcons);


 /* Loading page */

const mySplineViewer = document.getElementById('spline-viewer');

mySplineViewer.addEventListener('load-complete', (e) => {
	console.log('loading completed', e.detail.url);
  document.querySelector("#loader").style.display = "none";
});



// Cards 

$(() => {
  $(".box").tilt({
    maxTilt: 30,
    perspective: 1400,
    easing: "cubic-bezier(.03,.98,.52,.99)",
    speed: 300,
    glare: true,
    maxGlare: 0.2,
    scale: 1.04
  });

  [...cards].forEach((box) => {
    box.addEventListener('click', function () {
      console.log("1111111111111")      
      // [...cards].forEach(box => {
      //   box.classList.remove('is-flipped')
      // })
      // box.classList.add('is-flipped'); // Adds or removes the 'is-flipped' class
  

      box.removeAttribute('style')
      box.classList.toggle('is-flipped'); // Adds or removes the 'is-flipped' class

      if(!box.classList.contains('is-flipped')) {
        $(box).tilt({
          maxTilt: 30,
          perspective: 1400,
          easing: "cubic-bezier(.03,.98,.52,.99)",
          speed: 1200,
          glare: true,
          maxGlare: 0.2,
          scale: 1.04
        });
      
      } else {

        const tilt = $(box).tilt();
        tilt.tilt.destroy.call(tilt);
      }
    });
  });
})