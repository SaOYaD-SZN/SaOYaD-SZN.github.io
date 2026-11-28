(() => {
  "use strict";

  const CONFIG = {
    user: "SaOYaD-SZN",
    api: "https://api.github.com",
    themeKey: "saoyad-studio-theme",
    cacheKey: "saoyad-studio-public-profile-v1"
  };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const projectUrls = {
    academy: "https://discord.gg/2aRd2B52qZ",
    hyprland: "https://github.com/SaOYaD-SZN/Hyprland-Dots",
    neovim: "https://github.com/SaOYaD-SZN/Neovim-Dots",
    wallpapers: "https://github.com/SaOYaD-SZN/Aesthetic-Wallpapers",
    hoshiko: "https://github.com/SaOYaD-SZN/Hoshiko-bot"
  };

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showToast = message => {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
  };

  const setTheme = theme => {
    const value = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = value === "dark" ? "#100b19" : "#f8f5fb";
    const button = $("#theme-toggle");
    if (button) {
      const label = value === "dark" ? "Switch to light theme" : "Switch to dark theme";
      button.setAttribute("aria-label", label);
      button.title = label;
    }
    try { localStorage.setItem(CONFIG.themeKey, value); } catch {}
  };

  const initTheme = () => {
    let saved = null;
    try { saved = localStorage.getItem(CONFIG.themeKey); } catch {}
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(saved || (prefersLight ? "light" : "dark"));
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
      const open = toggle.getAttribute("aria-expanded") !== "true";
      panel?.classList.toggle("open", open);
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
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
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
      if (progress) progress.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + "%";
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (!queued) {
        window.requestAnimationFrame(update);
        queued = true;
      }
    }, { passive: true });
    update();
    back?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }));
  };

  const initReveal = () => {
    const targets = $$(".section-heading,.academy-panel,.academy-stats,.feature-card,.project-card,.workbench-layout,.learning-card,.about-card,.terminal-window,.activity-card,.connect-panel");
    if (!("IntersectionObserver" in window) || reducedMotion()) return;
    targets.forEach(node => node.classList.add("reveal"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    targets.forEach(node => observer.observe(node));
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
      if (status) status.textContent = "Showing " + shown + " of " + cards.length + " projects.";
    };
    buttons.forEach(button => button.addEventListener("click", () => {
      selected = button.dataset.filter || "all";
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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
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
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(command);
        showToast("Clone command copied ✿");
      } catch {
        showToast("Clipboard is unavailable in this browser.");
      }
    }));
  };

  const initTerminal = () => {
    const output = $("#terminal-output");
    const form = $("#terminal-form");
    const input = $("#terminal-input");
    const addLine = (value, className) => {
      if (!output) return;
      const p = document.createElement("p");
      if (className) p.className = className;
      p.textContent = value;
      output.appendChild(p);
      output.scrollTop = output.scrollHeight;
    };
    const commands = {
      help: () => {
        addLine("A tiny map of this corner of the internet ✿", "terminal-good");
        addLine("about       A little introduction");
        addLine("focus       What I am learning right now");
        addLine("projects    A list of featured builds");
        addLine("stack       Languages and tools");
        addLine("open <name> academy | hyprland | neovim | wallpapers | hoshiko");
        addLine("github      Open the GitHub profile");
        addLine("contact     Jump to the social links");
        addLine("theme       Switch between dark and light");
        addLine("clear       Clear this window");
      },
      about: () => {
        addLine("SaOYaD — a computer-engineering learner who learns by building.");
        addLine("Main build: STEAMer ACADEMY INFINITY.");
      },
      focus: () => {
        addLine("Python + Discord systems, JavaScript fundamentals, and Linux / OS concepts.");
      },
      projects: () => {
        addLine("Flagship: STEAMer ACADEMY INFINITY");
        addLine("Also: Hyprland-Dots · Neovim-Dots · Aesthetic-Wallpapers · Hoshiko-bot");
        addLine("Hoshiko is a separate bot project; STEAMer ACADEMY is the main one.", "terminal-muted");
      },
      stack: () => {
        addLine("Python · discord.py · SQLite · JSON · Pillow");
        addLine("JavaScript · Node.js · discord.js · HTML · CSS");
        addLine("Arch Linux · Hyprland · Neovim · ZSH · Git + GitHub", "terminal-good");
      },
      github: () => {
        addLine("Opening github.com/SaOYaD-SZN …", "terminal-good");
        window.open("https://github.com/SaOYaD-SZN", "_blank", "noopener,noreferrer");
      },
      contact: () => {
        addLine("GitHub · Discord · YouTube · X · Reddit");
        document.querySelector("#connect")?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
      },
      theme: () => {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
        addLine("Theme switched ✧", "terminal-good");
      },
      clear: () => { if (output) output.replaceChildren(); }
    };
    const aliases = {
      "steamer-academy": "academy",
      "hyprland-dots": "hyprland",
      "neovim-dots": "neovim",
      "aesthetic-wallpapers": "wallpapers",
      "hoshiko-bot": "hoshiko"
    };
    const openProject = key => {
      const normal = aliases[key] || key;
      if (!projectUrls[normal]) {
        addLine("I don't know that project yet. Try: academy, hyprland, neovim, wallpapers, hoshiko.", "terminal-error");
        return;
      }
      addLine("Opening " + normal + " …", "terminal-good");
      window.open(projectUrls[normal], "_blank", "noopener,noreferrer");
    };
    const run = raw => {
      const value = raw.trim();
      if (!value) return;
      addLine("$ " + value, "terminal-accent");
      const parts = value.toLowerCase().split(/\s+/);
      const name = parts[0];
      if (name === "open") {
        if (!parts[1]) { addLine("Try: open academy", "terminal-muted"); return; }
        openProject(parts.slice(1).join("-"));
        return;
      }
      if (commands[name]) { commands[name](); return; }
      addLine("Command not found: " + name + ". Type help to see the little map.", "terminal-error");
    };
    form?.addEventListener("submit", event => {
      event.preventDefault();
      run(input?.value || "");
      if (input) input.value = "";
    });
    $$(".command-chips button").forEach(button => button.addEventListener("click", () => {
      run(button.dataset.command || "");
      input?.focus();
    }));
    $("#terminal-clear")?.addEventListener("click", () => { if (output) output.replaceChildren(); });
  };

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
    const types = {
      PushEvent: ["P", "Pushed code"],
      CreateEvent: ["+", "Created"],
      WatchEvent: ["★", "Starred"],
      ForkEvent: ["F", "Forked"],
      IssuesEvent: ["!", "Issue activity"],
      PullRequestEvent: ["↗", "Pull request"],
      ReleaseEvent: ["R", "Published a release"]
    };
    const relevant = events.filter(event => types[event.type]).slice(0, 5);
    if (!relevant.length) {
      list.replaceChildren();
      const p = document.createElement("p");
      p.className = "activity-placeholder";
      p.textContent = "No recent public events are available. Visit GitHub to explore the full activity history.";
      list.appendChild(p);
      return;
    }
    list.replaceChildren();
    relevant.forEach(event => {
      const config = types[event.type];
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
      } else if (event.type === "IssuesEvent" || event.type === "PullRequestEvent") {
        description.textContent = (payload.action || "Updated") + (event.type === "IssuesEvent" ? " an issue" : " a pull request");
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
    const set = (id, value) => {
      const node = $("#" + id);
      if (node) node.textContent = value;
    };
    const number = value => new Intl.NumberFormat("en").format(value || 0);
    set("stat-repos", number(user.public_repos));
    set("stat-followers", number(user.followers));
    set("stat-following", number(user.following));
    set("stat-stars", number(repos.reduce((sum, repo) => sum + (Number(repo.stargazers_count) || 0), 0)));
    repos.forEach(repo => {
      const language = $('[data-repo-language="' + repo.name + '"]');
      const stars = $('[data-repo-stars="' + repo.name + '"]');
      if (language && repo.language) language.textContent = repo.language;
      if (stars) stars.textContent = "★ " + (repo.stargazers_count || 0) + " · " + (repo.forks_count || 0) + " forks";
    });
    renderEvents(events);
    const status = $("#api-status");
    if (status) {
      status.classList.remove("offline");
      status.innerHTML = "<i></i> LIVE PUBLIC DATA";
    }
  };

  const initGithub = async () => {
    const status = $("#api-status");
    try {
      const results = await Promise.all([
        fetchJSON(CONFIG.api + "/users/" + CONFIG.user),
        fetchJSON(CONFIG.api + "/users/" + CONFIG.user + "/repos?per_page=100&sort=updated")
      ]);
      if (!Array.isArray(results[1])) throw new Error("Unexpected repository response");
      let events = [];
      try {
        const recent = await fetchJSON(CONFIG.api + "/users/" + CONFIG.user + "/events/public?per_page=30");
        if (Array.isArray(recent)) events = recent;
      } catch (error) {
        console.info("Public events are temporarily unavailable:", error);
      }
      renderGithub(results[0], results[1], events);
      try {
        localStorage.setItem(CONFIG.cacheKey, JSON.stringify({ user: results[0], repos: results[1], events: events, savedAt: Date.now() }));
      } catch {}
    } catch (error) {
      console.warn("GitHub profile data is unavailable:", error);
      let cache = null;
      try { cache = JSON.parse(localStorage.getItem(CONFIG.cacheKey) || "null"); } catch {}
      if (cache?.user && Array.isArray(cache.repos) && Array.isArray(cache.events)) {
        renderGithub(cache.user, cache.repos, cache.events);
        if (status) status.innerHTML = "<i></i> SAVED SNAPSHOT";
      } else {
        if (status) {
          status.classList.add("offline");
          status.textContent = "GITHUB UNAVAILABLE";
        }
        const list = $("#activity-list");
        if (list) {
          list.replaceChildren();
          const p = document.createElement("p");
          p.className = "activity-placeholder";
          p.textContent = "The live feed could not load. The project links still work normally.";
          list.appendChild(p);
        }
      }
    }
  };

  const initServiceWorker = () => {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker unavailable:", error));
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
    initTheme();
    initNavigation();
    initScroll();
    initReveal();
    initProjectFilters();
    initCopyButtons();
    initTerminal();
    initServiceWorker();
    initGithub();
  });
})();