// ============================================================
// seo.js – BetterGrowth Solutions
// Minimal SEO: JSON-LD, GA4, and click tracking
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // 1. GOOGLE ANALYTICS 4 (Replace G-XXXXXXXXXX with your ID)
    // ============================================================
    const GA_ID = 'G-XXXXXXXXXX';
    if (GA_ID !== 'G-XXXXXXXXXX') {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    // ============================================================
    // 2. JSON-LD STRUCTURED DATA (Organization)
    // ============================================================
    const orgData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BetterGrowth Solutions",
        "url": "https://bettergrowthsolutions.com",
        "logo": "https://bettergrowthsolutions.com/logo.png",
        "description": "Performance marketing solutions for advertisers, publishers, and call centers.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Indore",
            "addressRegion": "Madhya Pradesh",
            "addressCountry": "IN"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9754007756",
            "contactType": "Sales",
            "email": "info@bettergrowthsolutions.com"
        }
    };

    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(orgData);
    document.head.appendChild(orgScript);

    // ============================================================
    // 3. JSON-LD BreadcrumbList (for current page)
    // ============================================================
    const pageName = document.title.split('–')[0].trim() || 'Home';
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://bettergrowthsolutions.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": pageName,
                "item": window.location.href
            }
        ]
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    // ============================================================
    // 4. CLICK TRACKING (CTA buttons & outbound links)
    // ============================================================
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, .btn, [data-cta]');
        if (!target) return;

        // Track CTA buttons
        if (target.classList.contains('btn') || target.closest('.btn')) {
            const text = target.innerText.trim().slice(0, 50);
            console.log('🔔 CTA clicked:', text);
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', { event_category: 'engagement', event_label: text });
            }
        }

        // Track outbound links
        const href = target.getAttribute('href');
        if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
            console.log('🔗 Outbound link:', href);
            if (typeof gtag !== 'undefined') {
                gtag('event', 'outbound_click', { event_category: 'outbound', event_label: href });
            }
        }
    });

    console.log('✅ SEO loaded');

})();