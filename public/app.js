let offset = 0;

async function loadDramas() {
    try {
        const response = await fetch(`/api/home?offset=${offset}&count=12&lang=id`);
        const data = await response.json();
        
        if (data.code === 0) {
            renderDramas(data.data);
            offset = data.next_offset;
            document.getElementById("load-more").style.display = 
                data.has_more ? "block" : "none";
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderDramas(dramas) {
    const container = document.getElementById("drama-list");
    
    dramas.forEach(drama => {
        const col = document.createElement("div");
        col.className = "col-md-3 col-6 mb-3";
        
        col.innerHTML = \`
            <div class="drama-card">
                <img src="\${drama.cover}" class="w-100 rounded" alt="\${drama.name}">
                <div class="mt-2">
                    <h6 class="text-truncate">\${drama.name}</h6>
                    <small class="text-muted">\${drama.episodes} Episode</small>
                    <a href="/drama.html?id=\${drama.id}" class="btn btn-sm btn-primary w-100 mt-2">
                        Tonton
                    </a>
                </div>
            </div>
        \`;
        
        container.appendChild(col);
    });
}

document.getElementById("load-more").addEventListener("click", loadDramas);
loadDramas();
