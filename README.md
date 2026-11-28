# SaOYaD — Personal Workbench

A project-led personal portfolio for a computer-engineering learner who learns by building Discord systems, experimenting with Linux, and refining developer tools.

**Live site:** https://saoyad-szn.github.io/  
**GitHub:** https://github.com/SaOYaD-SZN

## Portfolio direction

The site uses a soft-lavender / midnight-plum visual system, responsive layouts, accessible interactions, and a project-first structure. It is intentionally written as a learning journey rather than presenting the owner as an experienced professional.

## Flagship project: STEAMer ACADEMY INFINITY

STEAMer ACADEMY INFINITY is the main Python / discord.py bot and learning-community platform. The portfolio describes the R151 release snapshot.

The STEAMer ACADEMY source code is planned for a future GitHub publication. Until it is uploaded, the portfolio intentionally shows a “Coming soon” notice rather than linking to a repository that is not yet published.

R151's release documentation records **21 command groups**, **110 slash-command actions**, and compatibility with both s? and s! prefix routes.

Feature areas include:
- Learning: quizzes, flashcards, focus sessions, study tasks, exam countdowns, daily challenges, a private study dashboard, and weekly study quests.
- Community: subject-help threads, suggestion lifecycle controls, polls, announcements, support tickets, reaction roles, and welcome tools.
- Progress: community XP, levels, achievements, voice-study tracking, helpful recognition, invite statistics, and period-based leaderboards.
- Moderation: AutoMod action bundles, anti-spam and invite protection, verification, moderation logs, and audit verbosity.
- Member experience: AFK tracking, private missed-mentions inbox, profiles, music, and mini-games.
- UI: custom embeds, generated rank/profile cards, curated emoji assets, mascot artwork, and the Midnight Sakura visual system.

The R151 release validation notes report **277 passing offline tests**. Live Discord registration, permissions, component interactions and voice playback still require checks on the production host. The feature-map panel is an authored overview, not a screenshot of the live Discord interface.

## Other projects

- **Hyprland-Dots** — Arch Linux / Hyprland desktop configuration and workflow.
- **Neovim-Dots** — customizable Neovim configuration and editor tooling.
- **Aesthetic-Wallpapers** — curated wallpaper collection.
- **Hoshiko-bot** — a separate Node.js / discord.js bot project. It is not the main STEAMer ACADEMY bot.

## Website features

- Responsive project hub and flagship project case study
- Original locally hosted SVG artwork for the hero and project covers, with no remote screenshot dependency
- Browser-only toolbox: JSON formatter/minifier, text cleaner/counter, focus timer, and WCAG contrast checker
- Project search, category filters and copy-clone controls
- Interactive local portfolio terminal (does not execute operating-system commands)
- GitHub public profile statistics and recent public activity, with a saved snapshot fallback
- Dark / light themes, keyboard shortcut for project search, scroll progress, reduced-motion support
- PWA manifest and service worker with an offline navigation fallback

## Tech

- HTML5, CSS Grid / Flexbox / custom properties, vanilla JavaScript
- Local-only JavaScript utilities (tool input is not uploaded)
- GitHub public REST API
- GitHub Pages, Web App Manifest and Service Worker

## Local preview

    git clone https://github.com/SaOYaD-SZN/SaOYaD-SZN.github.io.git
    cd SaOYaD-SZN.github.io
    python3 -m http.server 8000

Open http://localhost:8000.

## Data and privacy

The GitHub section reads public profile, repository and public-event data. If the API is unavailable, the page can use a snapshot saved in that browser. The portfolio terminal is a local navigation demo and never executes system commands. This public profile intentionally avoids publishing school names, private deployment details, tokens, or credentials.

## License

See LICENSE.
