var cards = document.querySelectorAll('.box');

const joinCounterUrl = 'https://pax-endpoint-status-monitor.integrations-16e.workers.dev/api/join-counter';
const joinCountElement = document.getElementById('join-count');
const splineViewerElement = document.getElementById('spline-viewer');
const isCompactViewport = window.matchMedia('(max-width: 599px)').matches;
let joinCountRequestId = 0;
let joinTransitionStarted = false;

const compactJoinSuffixes = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
  'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
];

function formatCompactJoinCount(count) {
  const digits = count.toString();
  let scale = Math.floor((digits.length - 1) / 3);

  if (scale <= 0) {
    return new Intl.NumberFormat().format(count);
  }

  const suffix = compactJoinSuffixes[scale];
  if (!suffix) {
    const mantissa = digits[1] && digits[1] !== '0'
      ? `${digits[0]}.${digits[1]}`
      : digits[0];
    return `${mantissa}e${digits.length - 1}`;
  }

  const divisor = 1000n ** BigInt(scale);
  const tenths = (count * 10n) / divisor;
  const whole = tenths / 10n;
  const decimal = tenths % 10n;
  return `${whole}${decimal === 0n ? '' : `.${decimal}`}${suffix}`;
}

function renderJoinCount(count) {
  const exactCount = new Intl.NumberFormat().format(count);
  joinCountElement.textContent = count < 1000000n
    ? exactCount
    : formatCompactJoinCount(count);
  joinCountElement.setAttribute('aria-label', `Click counts ${exactCount}`);
  joinCountElement.setAttribute('data-tooltip', `Click counts\n${exactCount}`);
}

function animateJoinCollapse() {
  const targets = Array.from(document.querySelectorAll(
    '.loader-text, .label, #corner-hits, .join-control, .site-navigation'
  )).filter(element => getComputedStyle(element).display !== 'none');
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const maxDistance = Math.hypot(centerX, centerY) || 1;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('is-collapsing');

  return targets.map((element) => {
    const rect = element.getBoundingClientRect();
    const translateX = centerX - (rect.left + rect.width / 2);
    const translateY = centerY - (rect.top + rect.height / 2);
    const distance = Math.hypot(translateX, translateY);
    const horizontalPull = distance ? Math.abs(translateX) / distance : 0;
    const verticalPull = distance ? Math.abs(translateY) / distance : 0;
    const squeezeX = 1 - verticalPull * 0.3;
    const squeezeY = 1 - horizontalPull * 0.3;
    const skewX = (translateY / maxDistance) * 24;
    const skewY = (-translateX / maxDistance) * 24;
    const baseTransform = getComputedStyle(element).transform;
    const baseTransformSuffix = baseTransform === 'none' ? '' : ` ${baseTransform}`;
    const transformAt = (progress, scaleX, scaleY, shear) =>
      `translate3d(${translateX * progress}px, ${translateY * progress}px, 0) scale(${scaleX}, ${scaleY}) skew(${skewX * shear}deg, ${skewY * shear}deg)${baseTransformSuffix}`;
    const fadeOpacity = Number(getComputedStyle(element).opacity);

    return element.animate([
      {
        offset: 0,
        transform: transformAt(0, 1, 1, 0),
        opacity: fadeOpacity
      },
      {
        offset: 0.52,
        transform: transformAt(0.4, squeezeX, squeezeY, 0.55),
        opacity: fadeOpacity
      },
      {
        offset: 0.84,
        transform: transformAt(0.94, squeezeX * 0.45, squeezeY * 0.45, 1),
        opacity: fadeOpacity * 0.45
      },
      {
        offset: 1,
        transform: transformAt(1, 0.02, 0.02, 1),
        opacity: 0
      }
    ], {
      duration: prefersReducedMotion ? 1 : (isCompactViewport ? 900 : 1100),
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      fill: 'forwards'
    });
  });
}

async function updateJoinCount(method = 'GET', renderResult = true) {
  const requestId = ++joinCountRequestId;

  try {
    const response = await fetch(joinCounterUrl, { method });
    const data = await response.json();

    if (!response.ok) {
      const message = data && typeof data === 'object' && typeof data.error === 'string'
        ? data.error
        : `HTTP ${response.status}`;
      throw new Error(message);
    }

    if (!data || typeof data !== 'object' || typeof data.count !== 'string' || !/^\d+$/.test(data.count)) {
      throw new Error('The JOIN counter returned an invalid count.');
    }

    if (requestId === joinCountRequestId && renderResult) {
      renderJoinCount(BigInt(data.count));
    }
  } catch (error) {
    console.error(`Failed to ${method === 'POST' ? 'increment' : 'load'} the click count.`, error);

    if (requestId === joinCountRequestId && renderResult) {
      joinCountElement.textContent = 'Unavailable';
      joinCountElement.setAttribute('aria-label', 'Click counts unavailable');
      joinCountElement.setAttribute('data-tooltip', 'Click counts\nunavailable');
    }
  }
}

void updateJoinCount();

 /* Loading page */
 
let intro = 'loader';

 document.getElementById('start-button').addEventListener('click', async () => {
   if (joinTransitionStarted) {
     return;
   }

   joinTransitionStarted = true;
   void updateJoinCount('POST', false);
   intro = "loader";

   const main = document.getElementById('main');
   const loader = document.getElementById('loader');
   const navigation = document.querySelector('.site-navigation');

   stopWordsAnimation();
   const collapseAnimations = animateJoinCollapse();
   await Promise.all(collapseAnimations.map(animation => animation.finished));

   document.body.classList.remove('is-collapsing');
   collapseAnimations.forEach(animation => animation.cancel());
   navigation.classList.add('is-hidden');
   loader.style.display = 'none';
   main.style.display = 'block';
   splineViewerElement.addEventListener('load-complete', () => {
     requestAnimationFrame(() => {
       main.classList.add('delay');
     });
   }, { once: true });

   requestAnimationFrame(() => {
     requestAnimationFrame(() => {
       if (!splineViewerElement.hasAttribute('url')) {
         splineViewerElement.setAttribute('url', splineViewerElement.dataset.sceneUrl);
       }
     });
   });

 })




window.addEventListener('load',()=>{
  const join = document.getElementById('start-button')



});


window.addEventListener('load',()=>{
  const labels = document.querySelectorAll('.fade-in');

  if (isCompactViewport) {
    labels.forEach(el => {
      el.hidden = false;
      el.classList.add('active');
    });
    return;
  }

  labels.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('active');
    }, index * 150);
  });
});



// Animation Loader

  const label = Array.from(document.querySelectorAll('.label'))
  const scoreElement = document.getElementById('score');
  let score = 0

  let FPS = 60

  let width = window.innerWidth
    , height =window.innerHeight

  const bounds = { left: 0, top: 0, right: width, bottom: height };

  const setWordPosition = word => {
    word.element.style.transform =
      `translate3d(${Math.round(word.x)}px, ${Math.round(word.y)}px, 0)`;
  };

  const words = label.map(el => {
    const wordWidth = el.offsetWidth;
    const wordHeight = el.offsetHeight;
    const maxX = Math.max(bounds.left, bounds.right - wordWidth);
    const maxY = Math.max(bounds.top, bounds.bottom - wordHeight);

    const word = {
      element: el,
      bounds,
      x: bounds.left + Math.random() * (maxX - bounds.left),
      y: bounds.top + Math.random() * (maxY - bounds.top),
      width: wordWidth,
      height: wordHeight,
      velX: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2), 
      velY: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2)
    }
    setWordPosition(word);
    return word;
  })

  let previousFrameTime = 0;
  let animationFrameId;
  const animateWords = timestamp => {
    const frameScale = previousFrameTime
      ? Math.min((timestamp - previousFrameTime) * FPS / 1000, 2)
      : 1;
    previousFrameTime = timestamp;
    words.forEach(word => {
      const { left, top, right, bottom } = word.bounds;
      const maxX = Math.max(left, right - word.width);
      const maxY = Math.max(top, bottom - word.height);
      let hitX = false;
      let hitY = false;

      if (word.x <= left || word.x >= maxX) {
        word.velX *= -1;
        hitX = true;
      }

      if (maxY > top && (word.y <= top || word.y >= maxY)) {
        word.velY *= -1;
        hitY = true;
      }

      if (hitX && hitY) {
        score++;
        scoreElement.innerHTML = score;
      }

      word.x = Math.min(Math.max(word.x + word.velX, left), maxX);
      word.y = Math.min(Math.max(word.y + word.velY, top), maxY);
      setWordPosition(word);
    });
    animationFrameId = requestAnimationFrame(animateWords);
  };

  animationFrameId = requestAnimationFrame(animateWords);




    

// Stop Animation Loader

function stopWordsAnimation(){
  cancelAnimationFrame(animationFrameId);

  const loaderRect = document.getElementById('loader').getBoundingClientRect();
  words.forEach(word => {
    const rect = word.element.getBoundingClientRect();
    word.element.style.left = `${rect.left - loaderRect.left}px`;
    word.element.style.top = `${rect.top - loaderRect.top}px`;
    word.element.style.transform = 'none';
  });
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