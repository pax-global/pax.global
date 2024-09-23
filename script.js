var cards = document.querySelectorAll('.box');




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