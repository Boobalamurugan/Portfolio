// Function to check if the element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
}

// Function to add the "visible" class to the project container
function handleScroll() {
    const projectContainer = document.querySelector('.projects .project-container');
    if (isInViewport(projectContainer)) {
        projectContainer.classList.add('visible'); // Add class to trigger animation
    }
}

// Event listener for scroll events
window.addEventListener('scroll', handleScroll);

// Ensure the animation triggers on load if the container is already in view
window.addEventListener('load', handleScroll);

// Initial check on page load (in case the container is already in view)
handleScroll();
