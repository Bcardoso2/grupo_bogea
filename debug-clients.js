// debug-clients.js - Script para debugar API de clientes
require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugClientsAPI() {
  try {
    console.log('🔍 Debug da API de Clientes\n');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'grupo_bogea'
    });

    // 1. Verificar se a tabela clients existe
    console.log('1. Verificando tabela clients...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'clients'");
    
    if (tables.length === 0) {
      console.log('❌ Tabela "clients" não existe!');
      console.log('Execute o SQL para criar as tabelas.');
      return;
    }
    console.log('✅ Tabela "clients" existe');

    // 2. Verificar estrutura da tabela
    console.log('\n2. Estrutura da tabela clients:');
    const [columns] = await connection.execute("DESCRIBE clients");
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 3. Contar registros
    console.log('\n3. Contando registros...');
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM clients');
    console.log(`Total de clientes: ${count[0].total}`);

    // 4. Testar query da API
    console.log('\n4. Testando query da API...');
    try {
      const query = `
        SELECT c.*, u.name as created_by_name
        FROM clients c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE 1=1
        ORDER BY c.name
        LIMIT 10 OFFSET 0
      `;
      
      const [clients] = await connection.execute(query);
      console.log(`✅ Query executada com sucesso - ${clients.length} registros`);
      
      if (clients.length > 0) {
        console.log('Primeiro cliente:', {
          id: clients[0].id,
          name: clients[0].name,
          email: clients[0].email,
          created_by_name: clients[0].created_by_name
        });
      }
    } catch (queryError) {
      console.log('❌ Erro na query:', queryError.message);
    }

    // 5. Testar query de contagem
    console.log('\n5. Testando query de contagem...');
    try {
      const countQuery = `SELECT COUNT(*) as total FROM clients WHERE 1=1`;
      const [countResult] = await connection.execute(countQuery);
      console.log(`✅ Contagem executada com sucesso - ${countResult[0].total} registros`);
    } catch (countError) {
      console.log('❌ Erro na contagem:', countError.message);
    }

    // 6. Inserir cliente de teste se não houver nenhum
    if (count[0].total === 0) {
      console.log('\n6. Inserindo cliente de teste...');
      try {
        await connection.execute(`
          INSERT INTO clients (name, email, phone, cnpj, address, contact_person, status, notes, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'Empresa Teste Ltda',
          'teste@empresa.com',
          '(85) 99999-9999',
          '12.345.678/0001-90',
          'Rua Teste, 123 - Fortaleza/CE',
          'João Teste',
          'active',
          'Cliente de teste criado automaticamente',
          1
        ]);
        console.log('✅ Cliente de teste criado com sucesso');
      } catch (insertError) {
        console.log('❌ Erro ao criar cliente de teste:', insertError.message);
      }
    }

    await connection.end();
    console.log('\n✅ Debug concluído!');

  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

// Testar conexão direta com a API
async function testAPIEndpoint() {
  console.log('\n🌐 Testando endpoint da API...');
  
  try {
    const response = await fetch('http://localhost:5000/api/clients?page=1&limit=10', {
      headers: {
        'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua pelo token real
      }
    });
    
    console.log(`Status da resposta: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API respondeu com sucesso:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Erro da API:', errorText);
    }
  } catch (apiError) {
    console.log('❌ Erro ao chamar API:', apiError.message);
  }
}

debugClientsAPI().then(() => {
  // testAPIEndpoint(); // Descomente para testar a API diretamente
});