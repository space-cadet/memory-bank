document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Add copy buttons to code blocks
    document.querySelectorAll('pre').forEach(function(codeBlock) {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.textContent = 'Copy';
        
        copyButton.addEventListener('click', function() {
            const code = codeBlock.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(function() {
                copyButton.textContent = 'Copied!';
                setTimeout(function() {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
        });
        
        codeBlock.appendChild(copyButton);
    });
    
    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item a').forEach(function(link) {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) return;
            
            // This is a simple client-side search
            // For a real implementation, you might want to use a library like lunr.js
            document.querySelectorAll('.content h1, .content h2, .content h3, .content h4, .content p').forEach(function(element) {
                const text = element.textContent.toLowerCase();
                if (text.includes(query)) {
                    element.style.backgroundColor = 'yellow';
                } else {
                    element.style.backgroundColor = '';
                }
            });
        });
    }
});
