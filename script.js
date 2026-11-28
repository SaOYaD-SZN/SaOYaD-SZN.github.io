(() => {
  "use strict";

  const CONFIG = {
    user: "SaOYaD-SZN",
    api: "https://api.github.com",
    themeKey: "saoyad-theme",
    cacheKey: "saoyad-public-profile-v2"
  };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const repoUrls = {
    hyprland: "https://github.com/SaOYaD-SZN/Hyprland-Dots",
    neovim: "https://github.com/SaOYaD-SZN/Neovim-Dots",
    wallpapers: "https://github.com/SaOYaD-SZN/Aesthetic-Wallpapers",
    hoshiko: "https://github.com/SaOYaD-SZN/Hoshiko-bot"
  };

  const showToast = message => {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
  };

  const setTheme = theme => {
    const value = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = value === "dark" ? "#0a0811" : "#f8f5fc";
    const button = $("#theme-toggle");
    if (button) {
      button.setAttribute("aria-label", value === "dark" ? "Switch to light theme" : "Switch to dark theme");
      button.title = value === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
    try { localStorage.setItem(CONFIG.themeKey, value); } catch {}
  };

  const initTheme = () => {
    let saved = null;
    try { saved = localStorage.getItem(CONFIG.themeKey); } catch {}
    setTheme(saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    $("#theme-toggle")?.addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  };

  const initNavigation = () => {
    const toggle = $("#menu-toggle");
    const panel = $("#nav-panel");
    const close = () => {
      panel?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute("aria-label", "Open menu");
    };
    toggle?.addEventListener("click", () => {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".nav-links a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    document.addEventListener("click", event => {
      if (panel?.classList.contains("open") && !panel.contains(event.target) && !toggle?.contains(event.target)) close();
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$(".nav-links a").forEach(link => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", active);
        });
      }), { rootMargin: "-25% 0px -65% 0px" });
      $$("main section[id]").forEach(section => observer.observe(section));
    }
  };

  const initScroll = () => {
    const header = $("#top");
    const progress = $("#scroll-progress");
    const back = $("#back-top");
    let queued = false;
    const update = () => {
      const y = window.scrollY;
      header?.classList.toggle("scrolled", y > 12);
      back?.classList.toggle("visible", y > 420);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (!queued) { window.requestAnimationFrame(update); queued = true; }
    }, { passive: true });
    update();
    back?.addEventListener("click", () => window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    }));
  };

  const initProjectFilters = () => {
    const cards = $$(".project-card");
    const buttons = $$("#project-filters .filter");
    const input = $("#project-search");
    const empty = $("#no-results");
    const status = $("#project-status");
    let selected = "all";

    const filter = () => {
      const query = (input?.value || "").trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const categories = (card.dataset.categories || "").split(/\s+/);
        const matchesCategory = selected === "all" || categories.includes(selected);
        const haystack = (card.dataset.search + " " + card.dataset.name + " " + card.textContent).toLowerCase();
        const visible = matchesCategory && haystack.includes(query);
        card.hidden = !visible;
        if (visible) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = "Showing " + shown + " of " + cards.length + " featured projects.";
    };

    buttons.forEach(button => button.addEventListener("click", () => {
      selected = button.dataset.filter;
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      filter();
    }));
    input?.addEventListener("input", filter);
    document.addEventListener("keydown", event => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        input?.focus();
      }
    });
    filter();
  };

  const initCopyButtons = () => {
    $$(".copy-command").forEach(button => button.addEventListener("click", async () => {
      const command = "git clone " + button.dataset.clone;
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(command);
        showToast("Clone command copied.");
      } catch {
        showToast("Clipboard unavailable in this browser.");
      }
    }));
  };

  const terminal = (() => {
    const output = $("#terminal-output");
    const form = $("#terminal-form");
    const input = $("#terminal-input");
    const commandLinks = {
      hyprland: repoUrls.hyprland,
      neovim: repoUrls.neovim,
      wallpapers: repoUrls.wallpapers,
      hoshiko: repoUrls.hoshiko
    };
    const addLine = (text, className = "") => {
      if (!output) return;
      const p = document.createElement("p");
      if (className) p.className = className;
      p.textContent = text;
      output.appendChild(p);
      output.scrollTop = output.scrollHeight;
    };
    const commands = {
      help: () => {
        addLine("Available commands:", "terminal-good");
        addLine("  about       Who is SaOYaD?");
        addLine("  focus       Current learning focus");
        addLine("  setup       Show the workstation");
        addLine("  projects    List featured repositories");
        addLine("  open <name> Open a project: hyprland, neovim, wallpapers, hoshiko");
        addLine("  github      Open the GitHub profile");
        addLine("  contact     Show social links");
        addLine("  theme       Switch dark / light mode");
        addLine("  clear       Clear this terminal");
      },
      about: () => {
        addLine("SaOYaD — student, builder, Linux enthusiast.");
        addLine("Interested in clean, useful code and thoughtful digital spaces.");
      },
      focus: () => {
        addLine("Learning JavaScript and full-stack development.");
        addLine("Building with Python; exploring Linux, developer tools, and UI craft.");
      },
      setup: () => {
        addLine("ARCH LINUX  /  HYPRLAND  /  NEOVIM");
        addLine("ZSH + POWERLEVEL10K  /  VS CODE  /  GIT + GITHUB", "terminal-good");
      },
      projects: () => {
        addLine("Featured work:");
        addLine("  Hyprland-Dots · Neovim-Dots · Aesthetic-Wallpapers · Hoshiko-bot");
        addLine("Use: open <name> to visit a repository.", "terminal-muted");
      },
      github: () => {
        addLine("Opening github.com/SaOYaD-SZN …", "terminal-good");
        window.open("https://github.com/SaOYaD-SZN", "_blank", "noopener,noreferrer");
      },
      contact: () => {
        addLine("GitHub · Discord · YouTube · X · Reddit");
        addLine("Scroll to the Connect section for the links.", "terminal-muted");
        document.querySelector("#connect")?.scrollIntoView({ behavior: "smooth" });
      },
      theme: () => {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
        addLine("Theme switched.", "terminal-good");
      },
      clear: () => { if (output) output.replaceChildren(); }
    };

    const run = raw => {
      const value = raw.trim();
      if (!value) return;
      addLine("$ " + value, "terminal-accent");
      const parts = value.toLowerCase().split(/\s+/);
      const name = parts[0];
      if (name === "open") {
        const key = parts.slice(1).join("-");
        const known = Object.keys(commandLinks).find(k => k === key || (k === "hyprland" && key === "hyprland-dots") || (k === "neovim" && key === "neovim-dots") || (k === "wallpapers" && key === "aesthetic-wallpapers") || (k === "hoshiko" && key === "hoshiko-bot"));
        if (!known) { addLine("Unknown project. Try: open hyprland | neovim | wallpapers | hoshiko", "terminal-error"); return; }
        addLine("Opening " + known + " repository…", "terminal-good");
        window.open(commandLinks[known], "_blank", "noopener,noreferrer");
        return;
      }
      if (commands[name]) { commands[name](); return; }
      addLine("Command not found: " + name + ". Type help to see available commands.", "terminal-error");
    };

    form?.addEventListener("submit", event => {
      event.preventDefault();
      run(input?.value || "");
      if (input) input.value = "";
    });
    $$(".command-suggestions button").forEach(button => button.addEventListener("click", () => {
      run(button.dataset.command || "");
      input?.focus();
    }));
    $("#terminal-clear")?.addEventListener("click", () => { if (output) output.replaceChildren(); });
    return { run };
  })();

  const formatRelative = dateString => {
    const time = new Date(dateString).getTime();
    if (!Number.isFinite(time)) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago";
    return Math.floor(seconds / 604800) + "w ago";
  };

  const renderEvents = events => {
    const list = $("#activity-list");
    if (!list) return;
    const relevant = events.filter(event => ["PushEvent", "CreateEvent", "WatchEvent", "ForkEvent", "IssuesEvent", "PullRequestEvent", "ReleaseEvent"].includes(event.type)).slice(0, 5);
    if (!relevant.length) {
      list.innerHTML = '<p class="activity-placeholder">No recent public events are available. Visit GitHub to explore the full activity history.</p>';
      return;
    }
    const labels = {
      PushEvent: ["P", "Pushed code"],
      CreateEvent: ["+", "Created"],
      WatchEvent: ["★", "Starred"],
      ForkEvent: ["F", "Forked"],
      IssuesEvent: ["!", "Issue activity"],
      PullRequestEvent: ["↗", "Pull request"],
      ReleaseEvent: ["R", "Published a release"]
    };
    list.replaceChildren();
    relevant.forEach(event => {
      const config = labels[event.type];
      const row = document.createElement("div");
      row.className = "activity-item";
      const icon = document.createElement("span");
      icon.className = "activity-icon";
      icon.textContent = config[0];
      const copy = document.createElement("div");
      copy.className = "activity-copy";
      const title = document.createElement("strong");
      title.textContent = config[1] + " · " + (event.repo?.name || "GitHub");
      const description = document.createElement("span");
      const payload = event.payload || {};
      if (event.type === "PushEvent") {
        const commit = payload.commits?.[0];
        description.textContent = commit?.message ? commit.message.split("\n")[0].slice(0, 100) : "Updated a repository";
      } else if (event.type === "CreateEvent") {
        description.textContent = "Created " + (payload.ref_type || "a resource") + (payload.ref ? " · " + payload.ref : "");
      } else if (event.type === "IssuesEvent") {
        description.textContent = payload.action + " an issue";
      } else if (event.type === "PullRequestEvent") {
        description.textContent = payload.action + " a pull request";
      } else if (event.type === "ReleaseEvent") {
        description.textContent = "Released " + (payload.release?.name || payload.action || "a version");
      } else {
        description.textContent = "Public activity on " + (event.repo?.name || "GitHub");
      }
      const date = document.createElement("time");
      date.className = "activity-date";
      date.dateTime = event.created_at || "";
      date.textContent = formatRelative(event.created_at);
      copy.append(title, description);
      row.append(icon, copy, date);
      list.appendChild(row);
    });
  };

  const fetchJSON = async url => {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok) throw new Error("GitHub API returned " + response.status);
    return response.json();
  };

  const renderGithub = (user, repos, events) => {
    const set = (id, value) => { const node = $("#" + id); if (node) node.textContent = value; };
    set("stat-repos", new Intl.NumberFormat("en").format(user.public_repos || 0));
    set("stat-followers", new Intl.NumberFormat("en").format(user.followers || 0));
    set("stat-following", new Intl.NumberFormat("en").format(user.following || 0));
    const stars = repos.reduce((sum, repo) => sum + (Number(repo.stargazers_count) || 0), 0);
    set("stat-stars", new Intl.NumberFormat("en").format(stars));

    repos.forEach(repo => {
      const language = $('[data-repo-language="' + repo.name + '"]');
      const star = $('[data-repo-stars="' + repo.name + '"]');
      if (language && repo.language) language.textContent = repo.language;
      if (star) star.textContent = "★ " + (repo.stargazers_count || 0) + " · " + (repo.forks_count || 0) + " forks";
    });
    renderEvents(events);
    const status = $("#api-status");
    if (status) status.innerHTML = "<i></i> LIVE PUBLIC DATA";
  };

  const initGithub = async () => {
    const status = $("#api-status");
    try {
      const result = await Promise.all([
        fetchJSON(CONFIG.api + "/users/" + CONFIG.user),
        fetchJSON(CONFIG.api + "/users/" + CONFIG.user + "/repos?per_page=100&sort=updated"),
        fetchJSON(CONFIG.api + "/users/" + CONFIG.user + "/events/public?per_page=30")
      ]);
      if (!Array.isArray(result[1]) || !Array.isArray(result[2])) throw new Error("Unexpected GitHub response");
      renderGithub(result[0], result[1], result[2]);
      try { localStorage.setItem(CONFIG.cacheKey, JSON.stringify({ user: result[0], repos: result[1], events: result[2], savedAt: Date.now() })); } catch {}
    } catch (error) {
      console.warn("GitHub data unavailable:", error);
      let cache = null;
      try { cache = JSON.parse(localStorage.getItem(CONFIG.cacheKey) || "null"); } catch {}
      if (cache?.user && Array.isArray(cache.repos) && Array.isArray(cache.events)) {
        renderGithub(cache.user, cache.repos, cache.events);
        if (status) status.innerHTML = "<i></i> SAVED PROFILE SNAPSHOT";
      } else {
        if (status) { status.classList.add("offline"); status.textContent = "GITHUB UNAVAILABLE"; }
        const list = $("#activity-list");
        if (list) list.innerHTML = '<p class="activity-placeholder">The live feed could not load right now. The repositories and profile are still available on GitHub.</p>';
      }
    }
  };

  const initServiceWorker = () => {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker unavailable:", error)));
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
    initTheme();
    initNavigation();
    initScroll();
    initProjectFilters();
    initCopyButtons();
    initServiceWorker();
    initGithub();
  });
})();