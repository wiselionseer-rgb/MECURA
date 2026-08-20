const { execSync } = require('child_process');

try {
  console.log('Converting welcome background to WebP...');
  execSync('ffmpeg -y -i public/welcome-bg.mp4 -vcodec libwebp -lossless 0 -compression_level 4 -q:v 30 -loop 0 -vf scale=720:-1 public/welcome-bg.webp', { stdio: 'inherit' });
  
  console.log('Converting dashboard background to WebP...');
  execSync('ffmpeg -y -i public/dashboard-bg.mp4 -vcodec libwebp -lossless 0 -compression_level 4 -q:v 25 -loop 0 -vf scale=720:-1 public/dashboard-bg.webp', { stdio: 'inherit' });
  
  console.log('All WebP conversions completed successfully.');
} catch (error) {
  console.error('Error during WebP conversion:', error.message);
}
