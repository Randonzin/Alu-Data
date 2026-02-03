from flask import Flask, request, jsonify
import sqlite3

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 
DATABASE = "alunos.db"

# conecta com o banco
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# inicia o banco de dados
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            data_nascimento TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# listar alunos
@app.route("/alunos", methods=["GET"])
def listar_alunos():
    conn = get_db_connection()
    alunos = conn.execute("SELECT * FROM alunos").fetchall()
    conn.close()
    return jsonify([dict(a) for a in alunos])

# obter aluno por ID
@app.route("/alunos/<int:id>", methods=["GET"])
def obter_aluno(id):
    conn = get_db_connection()
    aluno = conn.execute("SELECT * FROM alunos WHERE id = ?", (id,)).fetchone()
    conn.close()
    if aluno is None:
        return jsonify({"erro": "Aluno não encontrado"}), 404
    return jsonify(dict(aluno))

# criar aluno (POST)
@app.route("/alunos", methods=["POST"])
def criar_aluno():
    dados = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO alunos (nome, data_nascimento, cpf, email)
        VALUES (?, ?, ?, ?)
    """, (dados["nome"], dados["data_nascimento"], dados["cpf"], dados["email"]))

    conn.commit()
    id_aluno = cursor.lastrowid
    conn.close()

    return jsonify({"id": id_aluno, **dados}), 201

# atualizar aluno (PUT)
@app.route("/alunos/<int:id>", methods=["PUT"])
def atualizar_aluno(id):
    dados = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE alunos SET nome=?, data_nascimento=?, cpf=?, email=?
        WHERE id=?
    """, (dados["nome"], dados["data_nascimento"], dados["cpf"], dados["email"], id))

    conn.commit()
    conn.close()

    return jsonify({"id": id, **dados})

# excluir aluno
@app.route("/alunos/<int:id>", methods=["DELETE"])
def excluir_aluno(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM alunos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": f"Aluno {id} excluído com sucesso"})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
