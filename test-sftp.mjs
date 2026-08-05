import SftpClient from 'ssh2-sftp-client';
async function test() {
  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: 'ftp.mecura.sementesagrada.com',
      port: 65002,
      username: 'u653595657.institutomecura',
      password: 'Jesus102030@@'
    });
    console.log("Connected!");
    await sftp.end();
  } catch (e) {
    console.error(e);
  }
}
test();
