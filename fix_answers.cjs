const fs = require('fs');

const pathDiag = 'src/screens/DiagnosisScreen.tsx';
let contentDiag = fs.readFileSync(pathDiag, 'utf8');
contentDiag = contentDiag.replace('const objectives = answers.objectives || [];', 'const objectives = (answers && answers.objectives) || [];');
contentDiag = contentDiag.replace("const intensity = parseInt(answers.intensity || '5');", "const intensity = parseInt((answers && answers.intensity) || '5');");
fs.writeFileSync(pathDiag, contentDiag, 'utf8');

const pathChat = 'src/screens/ChatScreen.tsx';
let contentChat = fs.readFileSync(pathChat, 'utf8');
contentChat = contentChat.replace("answers?.objectives?.length", "(answers && answers.objectives && answers.objectives.length)");
contentChat = contentChat.replace("answers.objectives.join", "answers.objectives.join"); // safe if length check passes
contentChat = contentChat.replace("answers?.description", "(answers && answers.description)");
contentChat = contentChat.replace("answers?.birthDate", "(answers && answers.birthDate)");
contentChat = contentChat.replace("answers?.cpf", "(answers && answers.cpf)");
fs.writeFileSync(pathChat, contentChat, 'utf8');

console.log('Added defensive answers checks');
