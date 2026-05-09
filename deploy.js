import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function deploy() {
  const sftp = new SftpClient();
  
  const config = {
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT) || 22,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD
  };

  if (!config.host || !config.username || !config.password) {
    console.error('❌ Erro: Configure as variáveis SFTP_HOST, SFTP_USER e SFTP_PASSWORD no seu .env');
    return;
  }

  try {
    console.log(`🚀 Iniciando deploy para ${config.host}...`);
    await sftp.connect(config);
    
    const remotePath = 'domains/mecura.sementesagrada.com/public_html';
    
    console.log(`📁 Enviando arquivos para: ${remotePath}`);
    // Tenta criar a pasta se não existir (opcional)
    try { await sftp.mkdir(remotePath, true); } catch (e) {}

    console.log('📦 Enviando pasta dist (Frontend)...');
    await sftp.uploadDir(path.join(process.cwd(), 'dist'), remotePath);
    
    console.log('⚙️ Enviando arquivos do servidor (Backend)...');
    try {
      // Enviamos o server.js (compilado pelo esbuild no npm run build)
      await sftp.put(path.join(process.cwd(), 'server.js'), `${remotePath}/server.js`);
      await sftp.put(path.join(process.cwd(), 'package.json'), `${remotePath}/package.json`);
    } catch (e) {
      console.log('⚠️ Aviso: Não foi possível enviar arquivos do servidor.', e.message);
    }
    
    console.log('✅ Deploy concluído com sucesso!');
    console.log('\n📌 LEMBRETE:');
    console.log('1. Verifique se o seu arquivo .env está configurado na Hostinger.');
    console.log('2. As chaves MERCADO_PAGO_ACCESS_TOKEN e GEMINI_API_KEY são obrigatórias para o funcionamento.');
    console.log('3. Certifique-se que o "Entry File" no painel Node.js da Hostinger é server.js');
  } catch (err) {
    console.error('❌ Erro durante o deploy:', err.message);
  } finally {
    await sftp.end();
  }
}

deploy();
