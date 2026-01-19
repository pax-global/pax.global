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
 
let intro = 'loader';

document.getElementById('start-button').addEventListener('click',() =>{
  intro = "loader"

  document.getElementById('loader').style.display = 'none';
  document.getElementById('main').style.display = 'block';

  stopWordsAnimation();
})



// Animation Loader

  const label = document.querySelectorAll('.label')
  const scoreElement = document.getElementById('score');
  let score = 0

  let FPS = 60

  let width = window.innerWidth
    , height =window.innerHeight


  let words = Array.from(label).map(el =>{
      
    return {
      element: el,
      x:Math.random() * (width - 200),
      y:Math.random() * (height - 50),
      width: el.offsetWidth,  
      height: el.offsetHeight, 
      velX: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2), 
      velY: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2)
    }
  })  
      
  let animationInterval = setInterval(() => {
    
  words.forEach(word =>{

    let rect = word.element.getBoundingClientRect()

    let hitX = false;
    let hitY = false;

    if (word.x + rect.width >= width || word.x <= 0) {
        word.velX *= -1;
        hitX = true;
    }

    if (word.y + rect.height >= height || word.y <= 0) {
        word.velY *= -1;
        hitY = true;
    }



    if(hitX && hitY) {
      score++;
      scoreElement.innerHTML = score;
    }

      word.x += word.velX;
      word.y += word.velY;

      word.element.style.left = word.x + 'px';
      word.element.style.top = word.y + 'px';
      

    });

  }, 1000 / FPS)
    

// Stop Animation Loader

function stopWordsAnimation(){
  clearInterval(animationInterval);
}


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