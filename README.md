# SaOYaD — Personal Portfolio

A personal portfolio built with semantic HTML, modern CSS, and vanilla JavaScript. Published with GitHub Pages.

**Live site:** https://saoyad-szn.github.io/  
**GitHub:** https://github.com/SaOYaD-SZN

## Design

The site uses a restrained midnight-violet visual identity: editorial typography, soft atmospheric gradients, subtle glass surfaces, and small decorative details. The layout is responsive and supports both dark and light themes.

## Features

- Responsive navigation with keyboard and mobile support
- Persistent dark/light theme preference
- Live public GitHub profile statistics and repository showcase
- Searchable projects with language filters
- Graceful GitHub API fallback to the last locally cached snapshot
- PWA manifest and service-worker app-shell caching
- Offline page navigation after the first successful cache
- SEO metadata, Open Graph previews, sitemap, and robots.txt
- Reduced-motion support, semantic sections, visible focus styles, and skip link

## Tech stack

- HTML5
- CSS (custom properties, grid, flexbox, responsive media queries)
- Vanilla JavaScript (Fetch API, IntersectionObserver, Service Worker)
- GitHub REST API (public endpoints only)
- GitHub Pages

## Run locally

    git clone https://github.com/SaOYaD-SZN/SaOYaD-SZN.github.io.git
    cd SaOYaD-SZN.github.io
    python3 -m http.server 8000

Open http://localhost:8000.

## Notes

- GitHub profile and repository data is fetched from public GitHub API endpoints. If the API is unavailable and no saved browser snapshot exists, the site links visitors directly to the repository profile instead of displaying invented statistics.
- The site has no build step or package dependencies.
- Service-worker caching applies only to same-origin GET requests. Failed asset requests remain failed requests rather than receiving the HTML homepage as a misleading fallback.

## License

See [LICENSE](LICENSE).