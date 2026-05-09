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
    
    // O servidor Node.js só vai funcionar se seu plano Hostinger suportar Node.js
    console.log('⚙️ Enviando arquivos do servidor (Backend)...');
    try {
      await sftp.put(path.join(process.cwd(), 'server.ts'), `${remotePath}/server.ts`);
      await sftp.put(path.join(process.cwd(), 'package.json'), `${remotePath}/package.json`);
    } catch (e) {
      console.log('⚠️ Aviso: Não foi possível enviar arquivos do servidor. Se seu plano for apenas estático, ignore este aviso.');
    }
    
    console.log('✅ Deploy concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o deploy:', err.message);
  } finally {
    await sftp.end();
  }
}

deploy();
