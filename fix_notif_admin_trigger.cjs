const fs = require('fs');
let n = fs.readFileSync('src/utils/notifications.ts', 'utf8');

if (!n.includes('triggerAdminBackgroundPush')) {
  n += `
export const triggerAdminBackgroundPush = async (title: string, body: string, url: string = '/doctor') => {
  try {
    await fetch('/api/send-admin-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url })
    });
  } catch (error) {
    console.error('Failed to trigger admin background push', error);
  }
};
`;
  fs.writeFileSync('src/utils/notifications.ts', n, 'utf8');
  console.log('triggerAdminBackgroundPush added.');
}
