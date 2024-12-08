
// Create a spotlight element
const spotlight = document.createElement('div');
spotlight.classList.add('spotlight');
document.body.appendChild(spotlight);

// Update the spotlight position based on mouse movement
document.body.addEventListener('mousemove', (e) => {
  // Use pageX and pageY to account for scrolling
  const x = e.pageX;
  const y = e.pageY;

  spotlight.style.top = `${y - 10}px`; // Center spotlight vertically
  spotlight.style.left = `${x}px`; // Center spotlight horizontally
});

document.body.addEventListener('mouseleave', () => {
  spotlight.style.opacity = '0'; // Hide spotlight when leaving the document.body
});

document.body.addEventListener('mouseenter', () => {
  spotlight.style.opacity = '1'; // Show spotlight when entering the document.body
});