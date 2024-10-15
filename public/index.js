document.addEventListener("DOMContentLoaded", function() {
    const testimonialSection = document.querySelector('.testimonials .row');

    // Carregar e exibir depoimentos do banco de dados
    function loadTestimonials() {
        fetch('http://localhost:5000/api/depoimentos')
            .then(response => response.json())
            .then(data => {
                testimonialSection.innerHTML = ''; // Limpa a seção antes de exibir
                data.forEach(depoimento => {
                    const testimonialDiv = document.createElement('div');
                    testimonialDiv.classList.add('col-md-6', 'mb-3');
                    testimonialDiv.innerHTML = `
                        <div class="p-3 border rounded">
                            <p class="testimonial">"${depoimento.mensagem}"</p>
                            <p><strong>- ${depoimento.nome}</strong></p>
                            <button class="btn btn-primary btn-curtir" data-id="${depoimento.id}">
                                Curtir <span class="badge bg-light text-dark">${depoimento.likes}</span>
                            </button>
                        </div>
                    `;
                    testimonialSection.appendChild(testimonialDiv);
                });

                // Adicionar evento de clique para curtir
                document.querySelectorAll('.btn-curtir').forEach(button => {
                    button.addEventListener('click', function() {
                        const depoimentoId = this.getAttribute('data-id');
                        curtirDepoimento(depoimentoId, this);
                    });
                });
            })
            .catch(err => console.error('Erro ao carregar depoimentos:', err));
    }

    // Enviar novo depoimento para o banco de dados
    document.getElementById('testimonialForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = document.getElementById('name').value;
        const mensagem = document.getElementById('message').value;

        // Enviar dados para o backend
        fetch('http://localhost:5000/api/depoimentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, mensagem })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar depoimento');
            }
            return response.json();
        })
        .then(() => {
            alert('Seu depoimento foi enviado com sucesso!');
            loadTestimonials(); // Recarregar os depoimentos para incluir o novo
            this.reset();
        })
        .catch(err => {
            console.error('Erro ao enviar depoimento:', err);
            alert('Ocorreu um erro ao enviar seu depoimento.');
        });
    });

    // Função para curtir um depoimento
    function curtirDepoimento(depoimentoId, button) {
        fetch(`http://localhost:5000/api/depoimentos/${depoimentoId}/curtir`, {
            method: 'POST',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao curtir o depoimento');
            }
            return response.json();
        })
        .then(() => {
            const badge = button.querySelector('.badge');
            let likesCount = parseInt(badge.textContent);
            likesCount++;
            badge.textContent = likesCount;
        })
        .catch(err => {
            console.error('Erro ao curtir depoimento:', err);
        });
    }

    // Carregar depoimentos quando a página for carregada
    loadTestimonials();
});