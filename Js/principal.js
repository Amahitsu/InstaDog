const API_URL = 'http://localhost:3000/posts';

// Função para carregar e renderizar posts
function fetchAndRenderPosts() {
    fetch(API_URL)
        .then(response => response.json())
        .then(posts => {
            document.getElementById('postsContainer').innerHTML = ''; // Limpa os posts anteriores
            posts.forEach(post => {
                const postHtml = `
                <div class="post" data-post-id="${post.id}">
                    <p>${post.content}</p>
                    <img id="image_Post" src="${post.image}" class="img-fluid" alt="Post Image">
                    <div class="container_Buttons"> 
                      <div class="button_Like">
                        <button class="like-btn ${post.likedByUser ? 'fas' : 'far'} fa-heart"></button>
                        <span class="like-count">${post.likes}</span>
                      </div>
                      <div class="buttons_Post">
                        <i class="delete-btn fas fa-trash" title="Excluir"></i>
                        <i class="edit-btn fas fa-edit" title="Editar"></i>
                      </div>
                    </div>
                    <div class="comment-input-wrapper">
                        <input type="text" class="comment-input" placeholder="Comente...">
                        <button class="add-comment-btn btn btn-primary">➤</button>
                    </div>                  
                    <div class="comment-list">
                        ${post.comments.map((comment, index) => `
                                    <div class="comment-item" data-comment-index="${index}">
                                        <div class="comment-content">
                                            <p>${comment}</p>
                                            <i class="hamburger-btn fas fa-ellipsis-v" title="Mais opções"></i>
                                            <div class="comment-options">
                                                <i class="edit-comment-btn fas fa-edit" title="Editar"></i>
                                                <i class="delete-comment-btn fas fa-trash" title="Excluir"></i>
                                            </div>
                                        </div>
                                    </div>
                        `).join('')}
                    </div>
                </div>
                `;
                document.getElementById('postsContainer').insertAdjacentHTML('beforeend', postHtml);
            });
        });
}


// Função para criar um novo post
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
                    // Atualiza a interface com o novo post
                    const postHtml = `
                    <div class="post" data-post-id="${data.id}">
                        <p>${data.content}</p>
                        <img src="${data.image}" class="img-fluid" alt="Post Image">
                        <button class="like-btn far fa-heart"></button>
                        <span class="like-count">${data.likes}</span>
                        <input type="text" class="comment-input" placeholder="Comente...">
                        <button class="add-comment-btn btn btn-primary">Adicionar Comentário</button>
                        <div class="comment-list"></div>
                        <button class="edit-btn btn btn-warning">Editar</button>
                        <button class="delete-btn btn btn-danger">Excluir</button>
                    </div>
                `;
                    document.getElementById('postsContainer').insertAdjacentHTML('afterbegin', postHtml);
                    document.getElementById('postText').value = ''; // Limpa o campo de texto
                    document.getElementById('postImage').value = ''; // Limpa o campo de imagem
                });
        };

        reader.readAsDataURL(postImage); // Converte a imagem para base64
    }
});

// Delegação de eventos para curtir, comentar, editar e excluir
document.getElementById('postsContainer').addEventListener('click', function (event) {
    const postElem = event.target.closest('.post');
    if (!postElem) return;

    const postId = postElem.getAttribute('data-post-id');

    // Lógica para curtir o post
    if (event.target.classList.contains('like-btn')) {
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

        // Atualiza o estado de curtida e o número de curtidas no servidor
        fetch(`${API_URL}/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likes: likeCount, likedByUser: !liked }) // Atualiza o estado de curtida
        })
            .then(response => response.json())
            .then(() => {
                // Atualiza o contador de curtidas na interface
                likeCountElem.textContent = likeCount;
            });
    }

    // Lógica para adicionar comentário ao clicar no botão
    if (event.target.classList.contains('add-comment-btn')) {
        const commentInput = postElem.querySelector('.comment-input');
        const newComment = commentInput.value;
        const commentList = postElem.querySelector('.comment-list');

        if (newComment.trim()) {
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
                    commentList.insertAdjacentHTML('beforeend', `
                        <div class="comment-item" data-comment-index="${commentList.children.length}">
                            <div class="comment-item" data-comment-index="${index}">
                                <div class="comment-content">
                                    <p>${newComment}</p>
                                    <i class="hamburger-btn fas fa-ellipsis-v" title="Mais opções"></i>
                                </div>
                                <div class="comment-options" style="display: none;">
                                <i class="edit-comment-btn fas fa-edit" title="Editar"></i>
                                <i class="delete-comment-btn fas fa-trash" title="Excluir"></i>
                                </div>
                            </div>
                        </div>
                    `);
                    commentInput.value = ''; // Limpa o campo de comentário
                });
        }
    }

    // Lógica para editar um comentário
    if (event.target.classList.contains('edit-comment-btn')) {
        const commentItem = event.target.closest('.comment-item');
        const commentIndex = commentItem.getAttribute('data-comment-index');
        const commentTextElem = commentItem.querySelector('p');
        const newCommentText = prompt('Edite o comentário:', commentTextElem.textContent);

        if (newCommentText !== null) {
            fetch(`${API_URL}/${postId}`)
                .then(response => response.json())
                .then(post => {
                    const updatedComments = [...post.comments];
                    updatedComments[commentIndex] = newCommentText;

                    return fetch(`${API_URL}/${postId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comments: updatedComments })
                    });
                })
                .then(() => {
                    // Atualiza o comentário na interface
                    commentTextElem.textContent = newCommentText;
                });
        }
    }

    // Lógica para excluir um comentário
    if (event.target.classList.contains('delete-comment-btn')) {
        const commentItem = event.target.closest('.comment-item');
        const commentIndex = commentItem.getAttribute('data-comment-index');

        fetch(`${API_URL}/${postId}`)
            .then(response => response.json())
            .then(post => {
                const updatedComments = post.comments.filter((_, index) => index != commentIndex);

                return fetch(`${API_URL}/${postId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: updatedComments })
                });
            })
            .then(() => {
                // Remove o comentário da interface
                commentItem.remove();
            });
    }

    // Lógica para editar o post
if (event.target.classList.contains('edit-btn')) {
    const postContent = postElem.querySelector('p');
    const newContent = prompt('Edite o conteúdo do post:', postContent.textContent);
    if (newContent !== null && newContent.trim() !== '') {
        fetch(`${API_URL}/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        })
        .then(response => response.json())
        .then(() => {
            // Atualiza o conteúdo do post na interface
            postContent.textContent = newContent;
        });
    }
}

// Lógica para excluir o post
if (event.target.classList.contains('delete-btn')) {
    if (confirm('Tem certeza que deseja excluir este post?')) {
        fetch(`${API_URL}/${postId}`, {
            method: 'DELETE'
        })
        .then(() => {
            // Remove o post da interface
            postElem.remove();
        });
    }
}

});

// Carrega os posts quando a página é carregada
document.addEventListener('DOMContentLoaded', fetchAndRenderPosts);
