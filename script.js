(() => {
  "use strict";
  const CONFIG={username:"SaOYaD-SZN",api:"https://api.github.com",themeKey:"saoyad-theme",cacheKey:"saoyad-github-data"};
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const safeText=(value,fallback="")=>typeof value==="string"&&value.trim()?value.trim():fallback;
  const validExternalUrl=value=>{try{const url=new URL(value);return["https:","http:"].includes(url.protocol)?url.href:null}catch{return null}};
  const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const compactNumber=value=>new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1}).format(Number(value)||0);

  const setTheme=theme=>{
    const selected=theme==="light"?"light":"dark";
    document.documentElement.dataset.theme=selected;
    const button=$("#theme-toggle");
    if(button){const label=selected==="dark"?"Switch to light theme":"Switch to dark theme";button.setAttribute("aria-label",label);button.title=label}
    try{localStorage.setItem(CONFIG.themeKey,selected)}catch{}
  };
  const initTheme=()=>{
    let saved=null;
    try{saved=localStorage.getItem(CONFIG.themeKey)}catch{}
    setTheme(saved||(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"));
    $("#theme-toggle")?.addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
  };

  const initNavigation=()=>{
    const toggle=$("#menu-toggle"),panel=$("#primary-navigation");
    const close=()=>{panel?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");toggle?.setAttribute("aria-label","Open navigation")};
    toggle?.addEventListener("click",()=>{
      const open=!panel.classList.contains("open");
      panel.classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
    });
    $$(".nav-link").forEach(link=>link.addEventListener("click",close));
    document.addEventListener("keydown",event=>{if(event.key==="Escape")close()});
    document.addEventListener("click",event=>{if(panel?.classList.contains("open")&&!panel.contains(event.target)&&!toggle?.contains(event.target))close()});
  };

  const initScrollEffects=()=>{
    const header=$(".site-header"),top=$("#back-to-top"),progress=$("#reading-progress");
    let scheduled=false;
    const update=()=>{
      const y=window.scrollY;
      header?.classList.toggle("scrolled",y>12);top?.classList.toggle("visible",y>450);
      const max=document.documentElement.scrollHeight-window.innerHeight;
      if(progress)progress.style.width=(max>0?Math.min(100,y/max*100):0)+"%";
      scheduled=false;
    };
    window.addEventListener("scroll",()=>{if(!scheduled){requestAnimationFrame(update);scheduled=true}},{passive:true});
    update();
    top?.addEventListener("click",()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
  };

  let allRepos=[],activeFilter="all";
  const applyProjectFilters=()=>{
    const grid=$("#projects-grid");if(!grid)return;
    const query=($("#project-search")?.value||"").trim().toLowerCase();
    const visible=allRepos.filter(repo=>{
      const language=repo.language||"Other";
      const matchesLanguage=activeFilter==="all"||language===activeFilter;
      const haystack=[repo.name,repo.description,language,...(repo.topics||[])].join(" ").toLowerCase();
      return matchesLanguage&&haystack.includes(query);
    }).slice(0,9);
    if(!visible.length){grid.innerHTML='<div class="project-empty">No projects match that search. Try another keyword or filter.</div>';return}
    grid.innerHTML=visible.map(repo=>{
      const language=safeText(repo.language,"Project"),description=safeText(repo.description,"A public repository exploring a technical idea.");
      const topics=Array.isArray(repo.topics)?repo.topics.slice(0,3):[];
      const homepage=validExternalUrl(repo.homepage),repoUrl=validExternalUrl(repo.html_url);
      const letter=safeText(repo.name,"R").replace(/[^a-z0-9]/gi,"").charAt(0).toUpperCase()||"R";
      let markup='<article class="project-card panel"><div class="project-card-top"><span class="project-symbol">'+escapeHTML(letter)+'<span>.</span></span><span class="project-language">'+escapeHTML(language)+'</span></div><div class="project-card-body"><p class="project-overline">PUBLIC REPOSITORY</p><h3>'+escapeHTML(repo.name)+'</h3><p>'+escapeHTML(description)+'</p><div class="project-tags">';
      markup+=[language,...topics].slice(0,4).map(tag=>'<span>'+escapeHTML(tag)+'</span>').join("");
      markup+='</div><a class="project-link" href="'+repoUrl+'" target="_blank" rel="noopener noreferrer">View repository <span aria-hidden="true">↗</span></a>';
      if(homepage)markup+='<a class="project-link" href="'+homepage+'" target="_blank" rel="noopener noreferrer">Open live project <span aria-hidden="true">↗</span></a>';
      return markup+'</div></article>';
    }).join("");
  };

  const renderProjects=repos=>{
    const grid=$("#projects-grid"),status=$("#projects-status");if(!grid)return;
    allRepos=repos.filter(repo=>!repo.fork&&!repo.archived&&validExternalUrl(repo.html_url))
      .sort((a,b)=>new Date(b.pushed_at||b.updated_at||0)-new Date(a.pushed_at||a.updated_at||0));
    const languages=Array.from(new Set(allRepos.map(repo=>repo.language).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
    const filters=$("#project-filters");
    if(filters){
      filters.innerHTML='<button class="filter-button active" type="button" data-filter="all" aria-pressed="true">All work</button>'+
        languages.slice(0,5).map(lang=>'<button class="filter-button" type="button" data-filter="'+escapeHTML(lang)+'" aria-pressed="false">'+escapeHTML(lang)+'</button>').join("");
      filters.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{
        activeFilter=button.dataset.filter;
        filters.querySelectorAll("button").forEach(item=>{const selected=item===button;item.classList.toggle("active",selected);item.setAttribute("aria-pressed",String(selected))});
        applyProjectFilters();
      }));
    }
    if(status)status.textContent=allRepos.length?"Showing "+Math.min(allRepos.length,9)+" of "+allRepos.length+" public projects · sorted by recent activity":"No public projects are available to display right now.";
    applyProjectFilters();
  };

  const renderGitHub=(user,repos,sourceLabel)=>{
    const set=(name,value)=>{const node=$('[data-stat="'+name+'"]');if(node)node.textContent=compactNumber(value)};
    set("repos",user.public_repos);set("followers",user.followers);set("following",user.following);
    const counts=new Map();
    repos.forEach(repo=>{if(repo.language)counts.set(repo.language,(counts.get(repo.language)||0)+1)});
    const sorted=Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]);
    set("languages",sorted.length);
    const list=$("#language-list"),count=$("#language-count");
    if(count)count.textContent=sorted.length+" LANGUAGES";
    if(list){
      if(!sorted.length)list.innerHTML='<p class="muted-copy">No language breakdown is available yet.</p>';
      else{
        const total=sorted.reduce((sum,item)=>sum+item[1],0);
        list.innerHTML=sorted.slice(0,6).map(item=>{
          const pct=Math.round(item[1]/total*100);
          return'<div class="language-row"><span class="language-name">'+escapeHTML(item[0])+'</span><span class="language-track"><span class="language-fill" style="width:'+pct+'%"></span></span><span class="language-value">'+pct+'%</span></div>';
        }).join("");
      }
    }
    const status=$("#github-status");
    if(status)status.textContent=sourceLabel==="live"?"Updated from the public GitHub API.":"Showing the last successfully saved public profile snapshot.";
  };

  const fetchJSON=async url=>{
    const response=await fetch(url,{headers:{Accept:"application/vnd.github+json"},signal:AbortSignal.timeout(9000)});
    if(!response.ok)throw new Error("GitHub returned "+response.status);
    return response.json();
  };

  const loadGitHub=async()=>{
    const status=$("#github-status");
    try{
      const results=await Promise.all([
        fetchJSON(CONFIG.api+"/users/"+CONFIG.username),
        fetchJSON(CONFIG.api+"/users/"+CONFIG.username+"/repos?per_page=100&sort=updated")
      ]);
      const user=results[0],repos=results[1];
      if(!user||!Array.isArray(repos))throw new Error("Unexpected GitHub response");
      try{localStorage.setItem(CONFIG.cacheKey,JSON.stringify({savedAt:Date.now(),user:user,repos:repos}))}catch{}
      renderProjects(repos);renderGitHub(user,repos,"live");
    }catch(error){
      console.warn("GitHub data could not be refreshed:",error);
      let snapshot=null;
      try{snapshot=JSON.parse(localStorage.getItem(CONFIG.cacheKey)||"null")}catch{}
      if(snapshot?.user&&Array.isArray(snapshot.repos)){renderProjects(snapshot.repos);renderGitHub(snapshot.user,snapshot.repos,"cache")}
      else{
        if(status)status.textContent="GitHub data is temporarily unavailable. Browse all repositories directly on GitHub.";
        const grid=$("#projects-grid");
        if(grid)grid.innerHTML='<div class="project-empty">Live projects could not be loaded. <a class="text-link" href="https://github.com/'+CONFIG.username+'?tab=repositories" target="_blank" rel="noopener noreferrer">Browse repositories ↗</a></div>';
        const search=$("#project-search");if(search)search.disabled=true;
        const filters=$("#project-filters");if(filters)filters.hidden=true;
      }
    }
  };

  const initInstallPrompt=()=>{
    let deferredPrompt=null;const button=$("#install-button");
    window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredPrompt=event;if(button)button.hidden=false});
    button?.addEventListener("click",async()=>{
      if(!deferredPrompt)return;
      deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;button.hidden=true;
    });
  };

  const initServiceWorker=()=>{
    if("serviceWorker"in navigator&&location.protocol==="https:"){
      window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(error=>console.warn("Offline support unavailable:",error)));
    }
  };

  document.addEventListener("DOMContentLoaded",()=>{
    const year=$("#year");if(year)year.textContent=String(new Date().getFullYear());
    initTheme();initNavigation();initScrollEffects();$("#project-search")?.addEventListener("input",applyProjectFilters);
    initInstallPrompt();initServiceWorker();loadGitHub();
  });
})();