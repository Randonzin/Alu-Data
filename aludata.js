
const API_URL = 'http://localhost:5000/alunos';


function isLoggedIn() {
    return sessionStorage.getItem('logged') === 'true';
}

function setLoggedIn() {
    sessionStorage.setItem('logged', 'true');
}

window.addEventListener('DOMContentLoaded', function() {
   
    if (!isLoggedIn()) {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('editPage').classList.remove('active');
        document.getElementById('viewPage').classList.remove('active');
    } else {
       
        showDashboard();
    }
});


function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('editPage').classList.remove('active');
    document.getElementById('viewPage').classList.remove('active');
}

function showEditPage() {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('editPage').classList.add('active');
    document.getElementById('viewPage').classList.remove('active');
}

function showViewPage() {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('editPage').classList.remove('active');
    document.getElementById('viewPage').classList.add('active');
    listarAlunos(); 
}


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoggedIn(); 
    showDashboard();
    return false; 
});


document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const aluno = {
        nome: document.getElementById('regNome').value,
        cpf: document.getElementById('regCpf').value,
        data_nascimento: document.getElementById('regData').value,
        email: document.getElementById('regEmail').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aluno)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Aluno registrado com sucesso! ID: ' + data.id);
            this.reset();
            
        } else {
            alert('Erro: ' + (data.erro || 'Não foi possível cadastrar o aluno'));
        }
    } catch (error) {
        alert('Erro de conexão com a API: ' + error.message);
    }
    
   
});


document.getElementById('atualizacaoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const id = document.getElementById('atuId').value;
    const aluno = {
        nome: document.getElementById('atuNome').value,
        cpf: document.getElementById('atuCpf').value,
        data_nascimento: document.getElementById('atuData').value,
        email: document.getElementById('atuEmail').value
    };

   
    Object.keys(aluno).forEach(key => {
        if (!aluno[key]) delete aluno[key];
    });

    try {
       
        const responseGet = await fetch(`${API_URL}/${id}`);
        
        if (!responseGet.ok) {
            alert('Aluno não encontrado!');
            return false;
        }

        const alunoAtual = await responseGet.json();
        
      
        const alunoAtualizado = {
            nome: aluno.nome || alunoAtual.nome,
            cpf: aluno.cpf || alunoAtual.cpf,
            data_nascimento: aluno.data_nascimento || alunoAtual.data_nascimento,
            email: aluno.email || alunoAtual.email
        };

       
        const responsePut = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alunoAtualizado)
        });

        const data = await responsePut.json();

        if (responsePut.ok) {
            alert('Aluno atualizado com sucesso!');
            this.reset();
         
        } else {
            alert('Erro: ' + (data.erro || 'Não foi possível atualizar o aluno'));
        }
    } catch (error) {
        alert('Erro de conexão com a API: ' + error.message);
    }
    
   
});


document.getElementById('exclusaoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const id = document.getElementById('exclId').value;

    if (!confirm('Tem certeza que deseja excluir este aluno?')) {
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Aluno excluído com sucesso!');
            this.reset();
            
        } else {
            alert('Erro: ' + (data.erro || 'Não foi possível excluir o aluno'));
        }
    } catch (error) {
        alert('Erro de conexão com a API: ' + error.message);
    }
    
    
});


async function listarAlunos() {
    try {
        const response = await fetch(API_URL);
        const alunos = await response.json();

        const lista = document.getElementById('studentList');
        
        if (alunos.length === 0) {
            lista.innerHTML = '<p style="text-align: center; color: #888;">Nenhum aluno cadastrado</p>';
            return;
        }

        lista.innerHTML = alunos.map(aluno => `
            <div class="student-item">
                <div class="student-avatar">👤</div>
                <div class="student-info">
                    ID: ${aluno.id} - ${aluno.nome} - CPF: ${aluno.cpf} - Nascimento: ${formatarData(aluno.data_nascimento)} - Email: ${aluno.email}
                </div>
            </div>
        `).join('');

    } catch (error) {
        alert('Erro ao listar alunos: ' + error.message);
    }
}

async function buscarPorId() {
    const id = prompt('Digite o ID do aluno:');
    
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
            alert('Aluno não encontrado!');
            return;
        }

        const aluno = await response.json();
        
        const lista = document.getElementById('studentList');
        lista.innerHTML = `
            <div class="student-item">
                <div class="student-avatar">👤</div>
                <div class="student-info">
                    ID: ${aluno.id} - ${aluno.nome} - CPF: ${aluno.cpf} - Nascimento: ${formatarData(aluno.data_nascimento)} - Email: ${aluno.email}
                </div>
            </div>
        `;

    } catch (error) {
        alert('Erro ao buscar aluno: ' + error.message);
    }
}


function formatarData(data) {
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}