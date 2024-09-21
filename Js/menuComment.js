document.getElementById('postsContainer').addEventListener('click', function (event) {
    const commentItem = event.target.closest('.comment-item');
    if (!commentItem) return;

    // Lógica para abrir/fechar as opções de comentário
    if (event.target.classList.contains('hamburger-btn')) {
        const options = commentItem.querySelector('.comment-options');
        const isVisible = options.style.display === 'block';

        // Alterna a visibilidade
        options.style.display = isVisible ? 'none' : 'block';
    }

    // Lógica para editar e excluir comentários
    if (event.target.classList.contains('edit-comment-btn')) {
        // Sua lógica para editar o comentário
    }

    if (event.target.classList.contains('delete-comment-btn')) {
        // Sua lógica para excluir o comentário
    }
});
