import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
dotenv.config({override: true});
console.log(process.env.SFTP_HOST, process.env.SFTP_PORT, process.env.SFTP_USER, process.env.SFTP_PASSWORD);
