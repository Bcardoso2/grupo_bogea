// test-clients-api.js - Teste direto da API
require('dotenv').config();
const axios = require('axios');

async function testClientsAPI() {
  try {
    console.log('🧪 Testando API de Clientes\n');
    
    // 1. Fazer login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@grupobogea.com',
      password: 'password'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('Token obtido:', token.substring(0, 20) + '...');
    
    // 2. Testar busca de clientes
    console.log('\n2. Testando busca de clientes...');
    const clientsResponse = await axios.get('http://localhost:5000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    
    console.log('✅ API de clientes funcionando!');
    console.log('Status:', clientsResponse.status);
    console.log('Dados:', clientsResponse.data);
    
    // 3. Testar com filtros
    console.log('\n3. Testando busca com filtros...');
    const filteredResponse = await axios.get('http://localhost:5000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 10,
        search: 'Construtora',
        status: 'active'
      }
    });
    
    console.log('✅ Busca com filtros funcionando!');
    console.log('Resultados filtrados:', filteredResponse.data.data?.clients?.length || 0);
    
  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Servidor não está rodando na porta 5000');
    }
  }
}

testClientsAPI();