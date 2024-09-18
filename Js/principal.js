// URL do servidor JSON Server
const API_URL = 'http://localhost:3000/posts';

// Função para criar um novo post e salvar no JSON Server
document.getElementById('publishPost').addEventListener('click', function () {
    const postText = document.getElementById('postText').value;
    const postImage = document.getElementById('postImage').files[0]; // Captura o arquivo de imagem

    if (postText.trim() && postImage) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const newPost = {
                content: postText,
                likes: 0,
                comments: [],
                image: e.target.result // Converte a imagem para base64
            };

            // Envia o post para o JSON Server
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPost)
            })
                .then(response => response.json())
                .then(data => {
                    // Atualiza a interface
                    const postHtml = `
                    <div class="post" data-post-id="${data.id}">
                        <p>${data.content}</p>
                        <img src="${data.image}" class="img-fluid" alt="Post Image">
                        <button class="like-btn far fa-heart"></button>
                        <span class="like-count">${data.likes}</span>
                        <input type="text" class="comment-input" placeholder="Comente...">
                        <div class="comment-list"></div>
                    </div>
                `;
                    document.getElementById('postsContainer').insertAdjacentHTML('afterbegin', postHtml);
                    document.getElementById('postText').value = '';
                    $('#createPostModal').modal('hide');
                });
        };

        reader.readAsDataURL(postImage); // Converte a imagem para base64
    }
});

// Função para carregar e renderizar posts
function fetchAndRenderPosts() {
    fetch(API_URL)
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const postHtml = `
                <div class="post" data-post-id="${post.id}">
                    <p>${post.content}</p>
                    <img src="${post.image}" class="img-fluid" alt="Post Image">
                    <button class="like-btn far fa-heart"></button>
                    <span class="like-count">${post.likes}</span>
                    <input type="text" class="comment-input" placeholder="Comente...">
                    <div class="comment-list">
                        ${post.comments.map(comment => `<p>${comment}</p>`).join('')}
                    </div>
                </div>
            `;
                document.getElementById('postsContainer').insertAdjacentHTML('beforeend', postHtml);
            });
        });
}

// Delegação de eventos para curtir e comentar
document.getElementById('postsContainer').addEventListener('click', function (event) {
    // Lógica para curtir o post
    if (event.target.classList.contains('like-btn')) {
        const postElem = event.target.closest('.post');
        const postId = postElem.getAttribute('data-post-id');
        const likeBtn = event.target;
        const likeCountElem = likeBtn.nextElementSibling;
        let likeCount = parseInt(likeCountElem.textContent);
        let liked = likeBtn.classList.contains('fas'); // Verifica se já foi curtido

        // Alterna o estado de curtida
        if (liked) {
            likeCount--;
            likeBtn.classList.remove('fas');
            likeBtn.classList.add('far');
        } else {
            likeCount++;
            likeBtn.classList.remove('far');
            likeBtn.classList.add('fas');
        }

        liked = !liked; // Atualiza o estado de curtida

        // Atualiza o número de curtidas no servidor
        fetch(`${API_URL}/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likes: likeCount })
        })
            .then(response => response.json())
            .then(() => {
                // Atualiza o contador de curtidas na interface
                likeCountElem.textContent = likeCount;
            });
    }

    // Lógica para adicionar um comentário
    if (event.target.classList.contains('comment-input')) {
        const commentInput = event.target;
        if (!commentInput.hasEventListener) { // Para garantir que o evento seja adicionado uma vez
            commentInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && commentInput.value.trim()) {
                    const postElem = commentInput.closest('.post');
                    const postId = postElem.getAttribute('data-post-id');
                    const commentList = postElem.querySelector('.comment-list');
                    const newComment = commentInput.value;

                    // Salva o novo comentário no servidor
                    fetch(`${API_URL}/${postId}`)
                        .then(response => response.json())
                        .then(post => {
                            const updatedComments = [...post.comments, newComment];

                            return fetch(`${API_URL}/${postId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ comments: updatedComments })
                            });
                        })
                        .then(() => {
                            // Adiciona o novo comentário na interface
                            commentList.insertAdjacentHTML('beforeend', `<p>${newComment}</p>`);
                            commentInput.value = ''; // Limpa o campo de comentário
                        });
                }
            });
            commentInput.hasEventListener = true; // Evita a adição de múltiplos event listeners
        }
    }
});

// Carrega os posts quando a página é carregada
document.addEventListener('DOMContentLoaded', fetchAndRenderPosts);
