import {Wheel} from '../../../dist/spin-wheel-esm.js';
import { cubicOut } from '../../../scripts/easing.js';
import {loadFonts, loadImages} from '../../../scripts/util.js';
import {props} from './props.js';

window.onload = async () => {

  await loadFonts(props.map(i => i.itemLabelFont));

  const wheel = new Wheel(document.querySelector('.wheel-wrapper'));

  const images = [];

  for (const p of props) {
    // Convert image urls into actual images:
    images.push(initImage(p, 'image'));
    images.push(initImage(p, 'overlayImage'));
    for (const item of p.items) {
      images.push(initImage(item, 'image'));
    }
  }

  await loadImages(images);

  // Show the wheel once everything has loaded
  document.querySelector('.wheel-wrapper').style.visibility = 'visible';

  wheel.init({
    ...props[0],
    rotation: wheel.rotation, // Preserve value.
  });

  // Save object globally for easy debugging.
  window.wheel = wheel;

  const btnSpin = document.querySelector('button');

  let index = 0
  window.addEventListener('click', (e) => {

    // Listen for click event on spin button:
    if (e.target === btnSpin) {
      const duration = 4000;
      const easing = cubicOut();
      wheel.spinToItem(index, duration, true, 2, 1, easing)
    }

  });

  function initImage(obj, pName) {
    if (!obj[pName]) return null;
    const i = new Image();
    i.src = obj[pName];
    obj[pName] = i;
    return i;
  }

};