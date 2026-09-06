const fs = require('fs');
const path = 'src/store/useAdminStore.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/catalogUrl: 'https:\/\/drive.google.com\/file\/d\/1QvJjJlj6gLaljo4-Jp0XhStUbwn_yYBA\/preview\?usp=drive_link',/, "catalogUrl: '/catalogo-inalada.pdf',");
code = code.replace(/catalogUrlNacional: 'https:\/\/firebasestorage.googleapis.com\/v0\/b\/ai-studio-24388a85-48b3-4d7c-ada6-78d81ace2fe5.firebasestorage.app\/o\/Catalogo_Nacional.pdf\?alt=media',/, "catalogUrlNacional: '/catalogo-oral.pdf',");

fs.writeFileSync(path, code);
