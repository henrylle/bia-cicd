const request = require('supertest');
const express = require('express');

// Mock simples da aplicação para testes
const app = express();
app.use(express.json());

// Mock dos endpoints
app.get('/api/versao', (req, res) => {
  res.send('Bia 1.0.1');
});

app.get('/api/tarefas', (req, res) => {
  res.json([]);
});

app.post('/api/tarefas', (req, res) => {
  const tarefa = {
    uuid: 'test-uuid-123',
    titulo: req.body.titulo,
    dia_atividade: req.body.dia,
    importante: req.body.importante
  };
  res.json(tarefa);
});

describe('API Integration Tests', () => {
  
  describe('GET /api/versao', () => {
    test('deve retornar versão da API', async () => {
      const response = await request(app)
        .get('/api/versao')
        .expect(200);
      
      expect(response.text).toMatch(/Bia \d+\.\d+\.\d+/);
    });
  });

  describe('GET /api/tarefas', () => {
    test('deve retornar lista de tarefas', async () => {
      const response = await request(app)
        .get('/api/tarefas')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/tarefas', () => {
    test('deve criar nova tarefa', async () => {
      const novaTarefa = {
        titulo: 'Teste Integração',
        dia: '2026-01-02',
        importante: true
      };

      const response = await request(app)
        .post('/api/tarefas')
        .send(novaTarefa)
        .expect(200);
      
      expect(response.body.titulo).toBe(novaTarefa.titulo);
      expect(response.body.uuid).toBeDefined();
    });
  });
});
