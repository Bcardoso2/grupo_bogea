// debug-auth.js - Script para debugar problemas de autenticação
// Execute com: node debug-auth.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'grupo_bogea'
    });
    
    console.log('✅ Conectado ao banco de dados');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    return null;
  }
}

async function checkUsersTable(connection) {
  try {
    console.log('\n📋 Verificando tabela de usuários...');
    
    // Verificar se a tabela existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Tabela "users" não existe!');
      return false;
    }
    
    console.log('✅ Tabela "users" existe');
    
    // Verificar estrutura da tabela
    const [columns] = await connection.execute("DESCRIBE users");
    console.log('\n📊 Estrutura da tabela:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    return false;
  }
}

async function listUsers(connection) {
  try {
    console.log('\n👥 Usuários no banco:');
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users'
    );
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return [];
    }
    
    users.forEach(user => {
      console.log(`  ID: ${user.id} | ${user.name} | ${user.email} | ${user.role}`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return [];
  }
}

async function testUserPassword(connection, email, password) {
  try {
    console.log(`\n🔐 Testando login: ${email} / ${password}`);
    
    // Buscar usuário
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return false;
    }
    
    const user = users[0];
    console.log(`✅ Usuário encontrado: ${user.name}`);
    
    // Verificar senha
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`🔑 Senha: ${isValid ? '✅ Correta' : '❌ Incorreta'}`);
    
    if (!isValid) {
      console.log(`📝 Hash no banco: ${user.password}`);
      console.log(`📝 Hash da senha "${password}": ${await bcrypt.hash(password, 10)}`);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Erro ao testar senha:', error);
    return false;
  }
}

async function createTestUser(connection, name, email, password, role = 'user') {
  try {
    console.log(`\n➕ Criando usuário: ${email}`);
    
    // Verificar se já existe
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log('⚠️ Usuário já existe!');
      return false;
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserir usuário
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    console.log(`✅ Usuário criado com ID: ${result.insertId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 Debug de Autenticação - Grupo Bogea\n');
  console.log('==========================================');
  
  // Conectar ao banco
  const connection = await createConnection();
  if (!connection) {
    process.exit(1);
  }
  
  try {
    // Verificar tabela
    const tableExists = await checkUsersTable(connection);
    if (!tableExists) {
      console.log('\n💡 Execute o script SQL para criar as tabelas primeiro!');
      process.exit(1);
    }
    
    // Listar usuários existentes
    const users = await listUsers(connection);
    
    // Criar usuários de teste se não existirem
    if (users.length === 0) {
      console.log('\n➕ Criando usuários de teste...');
      await createTestUser(connection, 'Administrador', 'admin@grupobogea.com', 'password', 'admin');
      await createTestUser(connection, 'Usuário Teste', 'user@grupobogea.com', 'password', 'user');
      
      // Listar novamente
      await listUsers(connection);
    }
    
    // Testar logins
    console.log('\n🧪 Testando autenticação...');
    await testUserPassword(connection, 'admin@grupobogea.com', 'password');
    await testUserPassword(connection, 'user@grupobogea.com', 'password');
    
    // Testar com senha errada
    await testUserPassword(connection, 'admin@grupobogea.com', 'senhaerrada');
    
    console.log('\n✅ Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);