// debug-auth-database.js - Debug completo de autenticação
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function debugAuthDatabase() {
  let connection;
  
  try {
    console.log('🔍 Debug Completo de Autenticação\n');
    
    // 1. Testar variáveis de ambiente
    console.log('1. Verificando variáveis de ambiente:');
    console.log(`DB_HOST: ${process.env.DB_HOST || '82.29.60.164'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'fribest'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'grupo_bogea'}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? 'fribest' : '[NÃO DEFINIDA]'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '[DEFINIDA]' : '[NÃO DEFINIDA]'}`);
    
    // 2. Testar conexão com configuração explícita
    console.log('\n2. Testando conexão com o banco...');
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'grupo_bogea',
      port: 3306,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    };
    
    console.log('Configuração de conexão:', {
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port
    });
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 3. Verificar se as tabelas existem
    console.log('\n3. Verificando tabelas...');
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('Tabelas encontradas:', tables.map(t => Object.values(t)[0]));
    
    // 4. Testar busca de usuário específico
    console.log('\n4. Testando busca de usuário...');
    const testEmail = 'user@grupobogea.com';
    
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (users.length === 0) {
      console.log(`❌ Usuário ${testEmail} não encontrado!`);
      
      // Listar todos os usuários
      const [allUsers] = await connection.execute(
        'SELECT id, name, email, role FROM users'
      );
      console.log('Usuários disponíveis:');
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) [${user.role}]`);
      });
      
    } else {
      const user = users[0];
      console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
      
      // 5. Testar verificação de senha
      console.log('\n5. Testando verificação de senha...');
      const testPassword = 'password';
      
      console.log(`Hash no banco: ${user.password}`);
      
      const isValidPassword = await bcrypt.compare(testPassword, user.password);
      console.log(`Senha "${testPassword}" válida: ${isValidPassword ? '✅ SIM' : '❌ NÃO'}`);
      
      if (!isValidPassword) {
        // Tentar gerar um novo hash para comparar
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log(`Novo hash gerado: ${newHash}`);
        
        // Atualizar senha se necessário
        console.log('\n6. Atualizando senha do usuário...');
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, testEmail]
        );
        console.log('✅ Senha atualizada!');
        
        // Testar novamente
        const isValidNow = await bcrypt.compare(testPassword, newHash);
        console.log(`Senha agora válida: ${isValidNow ? '✅ SIM' : '❌ NÃO'}`);
      }
    }
    
    // 7. Testar pool de conexões
    console.log('\n7. Testando pool de conexões...');
    const { pool } = require('./src/config/database');
    
    try {
      const [poolTest] = await pool.execute('SELECT 1 as test');
      console.log('✅ Pool de conexões funcionando!');
    } catch (poolError) {
      console.log('❌ Erro no pool:', poolError.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log('Código do erro:', error.code);
    console.log('Stack:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possíveis soluções:');
      console.log('  - Verifique se o MySQL está rodando');
      console.log('  - Verifique as credenciais no arquivo .env');
      console.log('  - Teste: mysql -u root -p');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConexão fechada.');
    }
  }
}

// Testar modelo User diretamente
async function testUserModel() {
  console.log('\n🧪 Testando modelo User...');
  
  try {
    const User = require('./src/models/User');
    
    // Testar busca por email
    const user = await User.findByEmail('user@grupobogea.com');
    
    if (user) {
      console.log('✅ Modelo User funcionando!');
      console.log('Usuário:', { id: user.id, name: user.name, email: user.email });
      
      // Testar verificação de senha
      const isValid = await User.verifyPassword('password', user.password);
      console.log('Senha válida:', isValid ? '✅ SIM' : '❌ NÃO');
      
    } else {
      console.log('❌ Usuário não encontrado via modelo');
    }
    
  } catch (modelError) {
    console.log('❌ Erro no modelo User:', modelError.message);
  }
}

debugAuthDatabase().then(() => {
  testUserModel();
});