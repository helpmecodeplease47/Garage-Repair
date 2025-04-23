// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

mobileMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  nav.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) {
    nav.classList.remove('active');
  }
});

// Form Submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  
  fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Message sent! We'll call you within 15 minutes.');
      this.reset();
    } else {
      alert('Error: Please call us directly at 385-454-5760');
    }
  });
});
