
function fetchAndRenderMenu2Posts() {
    fetch(API_URL)
        .then(response => response.json())
        .then(posts => {
            const menu2PostsContainer = document.getElementById('menu2PostsContainer');
            if (!menu2PostsContainer) {
                console.error('Container #menu2PostsContainer não encontrado');
                return;
            }

            menu2PostsContainer.innerHTML = ''; // Limpa o contêiner
            posts.forEach(post => {
                const postHtml = `
                <div class="col-md-4 mb-4">
                    <div class="post card" data-post-id="${post.id}">
                        <a href="/post/${post.id}">
                            <img id="img_Menu2" src="${post.image}" class="card-img-top img-fluid" alt="Post Image">
                        </a>
                    </div>
                </div>
                `;
                menu2PostsContainer.insertAdjacentHTML('beforeend', postHtml);
            });
        });
}

// Chame essa função quando o menu2 for carregado (ou clicado)
document.addEventListener('DOMContentLoaded', fetchAndRenderMenu2Posts);
