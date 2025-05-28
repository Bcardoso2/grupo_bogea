// generate-hash.js - Gerador simples de hash para qualquer senha
// Execute com: node generate-hash.js

const bcrypt = require('bcrypt');
const readline = require('readline');

// Configuração do readline para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateHash(password) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
    return null;
  }
}

async function verifyHash(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Erro ao verificar hash:', error);
    return false;
  }
}

function askForPassword() {
  return new Promise((resolve) => {
    rl.question('Digite a senha para gerar o hash: ', (password) => {
      resolve(password);
    });
  });
}

function askToContinue() {
  return new Promise((resolve) => {
    rl.question('\nDeseja gerar outro hash? (s/n): ', (answer) => {
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

async function main() {
  console.log('🔐 Gerador de Hash para Senhas\n');
  console.log('================================================');
  
  let continuar = true;
  
  while (continuar) {
    try {
      // Pedir senha
      const password = await askForPassword();
      
      if (!password) {
        console.log('❌ Senha não pode estar vazia!');
        continue;
      }
      
      console.log('\n⏳ Gerando hash...\n');
      
      // Gerar hash
      const hash = await generateHash(password);
      
      if (hash) {
        // Verificar se o hash está correto
        const isValid = await verifyHash(password, hash);
        
        console.log('✅ Hash gerado com sucesso!');
        console.log('================================================');
        console.log(`Senha: "${password}"`);
        console.log(`Hash:  ${hash}`);
        console.log(`Verificação: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
        console.log('================================================');
        
        // Mostrar exemplo de uso no SQL
        console.log('\n📋 Exemplo para usar no SQL:');
        console.log(`INSERT INTO users (name, email, password, role) VALUES`);
        console.log(`('Nome do Usuário', 'email@exemplo.com', '${hash}', 'user');`);
        
      } else {
        console.log('❌ Erro ao gerar hash!');
      }
      
      // Perguntar se quer continuar
      continuar = await askToContinue();
      
      if (continuar) {
        console.log('\n' + '='.repeat(50) + '\n');
      }
      
    } catch (error) {
      console.error('Erro:', error);
      continuar = false;
    }
  }
  
  console.log('\n👋 Obrigado por usar o gerador de hash!');
  rl.close();
}

// Verificar se há argumentos na linha de comando
if (process.argv[2]) {
  // Modo direto: node generate-hash.js "minhasenha"
  const password = process.argv[2];
  
  (async () => {
    console.log(`🔐 Gerando hash para: "${password}"\n`);
    
    const hash = await generateHash(password);
    const isValid = await verifyHash(password, hash);
    
    console.log('✅ Resultado:');
    console.log('================================================');
    console.log(`Senha: "${password}"`);
    console.log(`Hash:  ${hash}`);
    console.log(`Verificação: ${isValid ? '✅ Válido' : '❌ Inválido'}`);
    console.log('================================================\n');
    
    console.log('📋 SQL de exemplo:');
    console.log(`INSERT INTO users (name, email, password, role) VALUES`);
    console.log(`('Usuário', 'email@exemplo.com', '${hash}', 'user');`);
  })();
  
} else {
  // Modo interativo
  main().catch(console.error);
}