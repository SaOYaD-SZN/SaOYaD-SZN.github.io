const CONFIG = {
  GITHUB_USERNAME: 'SaOYaD-SZN',
  GITHUB_API_BASE: 'https://api.github.com',
  THEME_KEY: 'saoyad-theme'
};

const TYPEWRITER_TEXTS = ['Python', 'JavaScript', 'Linux', 'GitHub', 'Full-Stack'];

const sanitizeHTML = (value) => {
  const temp = document.createElement('div');
  temp.textContent = value ?? '';
  return temp.innerHTML;
};

const sanitizeURL = (value) => {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.href);
    if (['http:', 'https:'].includes(url.protocol)) return url.href;
    return value;
  } catch {
    return value;
  }
};

const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const themeButton = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');
const backToTop = document.querySelector('.back-to-top');

if (themeButton && navMenu) {
  themeButton.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    themeButton.classList.toggle('active', isOpen);
    themeButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      themeButton.classList.remove('active');
      themeButton.setAttribute('aria-expanded', 'false');
    });
  });
}

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 24;
  navbar?.classList.toggle('scrolled', scrolled);
  backToTop?.classList.toggle('visible', window.scrollY > 300);
});

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const startTypewriter = () => {
  const element = document.querySelector('.typewriter-text');
  if (!element) return;

  let index = 0;
  let textIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = TYPEWRITER_TEXTS[textIndex];
    if (deleting) {
      element.textContent = current.slice(0, index--);
      if (index < 0) {
        deleting = false;
        textIndex = (textIndex + 1) % TYPEWRITER_TEXTS.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, 50);
      return;
    }

    element.textContent = current.slice(0, index++);
    if (index > current.length) {
      deleting = true;
      setTimeout(tick, 1200);
      return;
    }
    setTimeout(tick, 90);
  };

  tick();
};

const renderSkills = () => {
  const skillsGrid = document.getElementById('skills-grid');
  if (!skillsGrid) return;

  const skillGroups = [
    {
      title: 'Languages',
      items: ['Python', 'JavaScript', 'HTML', 'CSS', 'Git', 'Bash']
    },
    {
      title: 'Frontend',
      items: ['UI design', 'Responsive layouts', 'Accessibility', 'PWA basics']
    },
    {
      title: 'Systems',
      items: ['Linux', 'Dotfiles', 'Automation', 'GitHub Pages']
    }
  ];

  skillsGrid.innerHTML = skillGroups.map(group => `
    <div class="panel skill-card">
      <h3>${group.title}</h3>
      <ul>
        ${group.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `).join('');
};

const getRepoLetter = (repoName) => repoName.replace(/[^a-z]/gi, '').slice(0, 1).toUpperCase() || 'R';

const renderProjects = (repos) => {
  const projectGrid = document.getElementById('projects-grid');
  if (!projectGrid) return;

  const ranked = repos
    .filter(repo => !repo.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  projectGrid.innerHTML = ranked.map((repo) => {
    const tags = [repo.language || 'Code', ...(repo.topics || []).slice(0, 2)];
    return `
      <article class="panel project-card">
        <div class="project-visual">
          <span class="project-badge">${repo.language || 'Project'}</span>
          <span class="project-letter">${getRepoLetter(repo.name)}</span>
        </div>
        <div class="project-meta">
          <h3>${sanitizeHTML(repo.name)}</h3>
          <p>${sanitizeHTML(repo.description || 'Practical project focused on solving a real problem or exploring a technical idea.')}</p>
          <div class="project-tags">
            ${tags.map(tag => `<span class="tag">${sanitizeHTML(tag)}</span>`).join('')}
          </div>
          <div class="project-actions">
            <a class="mini-link" href="${sanitizeURL(repo.html_url)}" target="_blank" rel="noreferrer noopener">Source</a>
            ${repo.homepage ? `<a class="mini-link" href="${sanitizeURL(repo.homepage)}" target="_blank" rel="noreferrer noopener">Live</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
};

const renderJourney = () => {
  const timeline = document.getElementById('journey-timeline');
  if (!timeline) return;
  const items = [
    {
      year: '2024',
      title: 'Profile and coding foundations',
      text: 'Started building public repositories and establishing a clear GitHub presence around config, tooling, and personal projects.'
    },
    {
      year: '2025',
      title: 'Portfolio and web experiments',
      text: 'Built the SaOYaD portfolio site and used GitHub Pages to publish a more polished personal presence.'
    },
    {
      year: '2026',
      title: 'Linux, automation, and deeper tooling',
      text: 'Expanded work around Python, JavaScript, dotfiles, and automation-focused projects while continuing to learn through hands-on building.'
    }
  ];

  timeline.innerHTML = items.map(item => `
    <article class="timeline-item panel">
      <time>${item.year}</time>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join('');
};

const renderActivity = (userData, repos) => {
  const activityGrid = document.getElementById('activity-grid');
  if (!activityGrid) return;
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const topLangs = Object.entries(
    repos.filter(r => r.language).reduce((acc, repo) => {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }));

  const maxCount = Math.max(...topLangs.map(lang => lang.value), 1);

  const stats = [
    { label: 'Repositories', value: userData.public_repos || repos.length },
    { label: 'Stars', value: totalStars },
    { label: 'Followers', value: userData.followers || 0 },
    { label: 'Languages', value: topLangs.length }
  ];

  const statsMarkup = stats.map(stat => `
    <div class="panel stat-card">
      <div class="label">${stat.label}</div>
      <div class="value">${stat.value}</div>
    </div>
  `).join('');

  const langMarkup = topLangs.length ? `
    <div class="panel stat-card" style="grid-column: 1 / -1;">
      <div class="label">Top languages</div>
      <div class="language-list">
        ${topLangs.map(lang => `
          <div class="lang-row">
            <span class="lang-name">${sanitizeHTML(lang.name)}</span>
            <div class="lang-bar"><span class="lang-fill" style="width: ${(lang.value / maxCount) * 100}%"></span></div>
            <span class="lang-value">${lang.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  activityGrid.innerHTML = `${statsMarkup}${langMarkup}`;
};

const renderContactLinks = () => {
  const contactLinks = document.getElementById('contact-links');
  const footerSocial = document.getElementById('footer-social');
  if (!contactLinks) return;
  const links = [
    { label: 'GitHub', href: 'https://github.com/SaOYaD-SZN', icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.17c-3.338.726-4.043-1.415-4.043-1.415-.546-1.386-1.333-1.756-1.333-1.756-1.09-.744.082-.729.082-.729 1.204.085 1.838 1.237 1.838 1.237 1.07 1.835 2.808 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.302-5.467-1.334-5.467-5.93 0-1.31.468-2.384 1.236-3.22-.124-.303-.536-1.522.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6.006 0c2.29-1.552 3.297-1.23 3.297-1.23.654 1.654.242 2.873.118 3.176.77.836 1.234 1.91 1.234 3.22 0 4.61-2.807 5.624-5.478 5.92.43.372.814 1.103.814 2.223v3.293c0 .318.217.694.825.576C20.565 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>' },
    { label: 'Portfolio', href: 'https://saoyad-szn.github.io/', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10 5"></path><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L14 19"></path></svg>' }
  ];

  const markup = links.map(link => `
    <a class="contact-link" href="${sanitizeURL(link.href)}" target="_blank" rel="noreferrer noopener">
      <span class="contact-link-left">${link.icon}<span>${link.label}</span></span>
      <span>↗</span>
    </a>
  `).join('');

  contactLinks.innerHTML = markup;
  if (footerSocial) {
    footerSocial.innerHTML = markup.replace(/contact-link/g, 'contact-link');
  }
};

const loadGitHubData = async () => {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${CONFIG.GITHUB_API_BASE}/users/${CONFIG.GITHUB_USERNAME}`),
      fetch(`${CONFIG.GITHUB_API_BASE}/users/${CONFIG.GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API unavailable');
    const userData = await userRes.json();
    const repos = await reposRes.json();

    renderProjects(repos);
    renderActivity(userData, repos);
    renderContactLinks();
    return { userData, repos };
  } catch (error) {
    console.warn('GitHub API failed; using fallback content.', error);
    const fallbackUser = {
      login: 'SaOYaD-SZN',
      public_repos: 8,
      followers: 0,
      following: 0,
      bio: 'Developer from Bangladesh exploring Python, JavaScript, Linux, and full-stack ideas.'
    };
    const fallbackRepos = [
      { name: 'SaOYaD-SZN.github.io', description: 'Personal portfolio website built for GitHub Pages.', language: 'JavaScript', stargazers_count: 1, fork: false, homepage: 'https://saoyad-szn.github.io/', html_url: 'https://github.com/SaOYaD-SZN/SaOYaD-SZN.github.io', topics: ['portfolio', 'github-pages'] },
      { name: 'Aesthetic-Wallpapers', description: 'Python project for working with aesthetic wallpaper collections.', language: 'Python', stargazers_count: 2, fork: false, homepage: '', html_url: 'https://github.com/SaOYaD-SZN/Aesthetic-Wallpapers', topics: ['python'] },
      { name: 'Hyprland-Dots', description: 'Linux dotfiles and custom desktop configuration work.', language: 'CSS', stargazers_count: 3, fork: false, homepage: '', html_url: 'https://github.com/SaOYaD-SZN/Hyprland-Dots', topics: ['linux', 'dotfiles'] },
      { name: 'Neovim-Dots', description: 'Neovim configuration and editor customization.', language: 'Lua', stargazers_count: 0, fork: false, homepage: '', html_url: 'https://github.com/SaOYaD-SZN/Neovim-Dots', topics: ['neovim'] }
    ];
    renderProjects(fallbackRepos);
    renderActivity(fallbackUser, fallbackRepos);
    renderContactLinks();
    return { userData: fallbackUser, repos: fallbackRepos };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  startTypewriter();
  renderSkills();
  renderJourney();
  renderContactLinks();
  loadGitHubData();
});
