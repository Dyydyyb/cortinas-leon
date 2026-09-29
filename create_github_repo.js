/**
 * Script para crear el repositorio cortinas-leon en GitHub
 * y hacer el push inicial.
 * Usa las credenciales almacenadas en git credential manager.
 */

const https = require('https');
const { execSync } = require('child_process');

// Obtener usuario de git config
let githubUser = '';
try {
  githubUser = execSync('git config --global user.name').toString().trim();
  console.log('Git user:', githubUser);
} catch(e) {
  console.error('No se pudo obtener user.name de git config');
  process.exit(1);
}

// Intentar obtener token de las variables de entorno o pedir al usuario
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!token) {
  console.log('\n⚠️  No se encontró GITHUB_TOKEN en las variables de entorno.');
  console.log('Por favor ejecutá:');
  console.log('  $env:GITHUB_TOKEN = "tu_token_aqui"');
  console.log('  node create_github_repo.js\n');
  console.log('O directamente con el token:');
  console.log('  $env:GITHUB_TOKEN = "ghp_xxxxx"; node create_github_repo.js');
  process.exit(1);
}

const repoData = JSON.stringify({
  name: 'cortinas-leon',
  description: 'Landing page profesional para Cortinas León — Venta, instalación, motorización y reparación de cortinas metálicas. Diseño responsivo con animaciones SVG.',
  homepage: '',
  private: false,
  auto_init: false,
  has_issues: true,
  has_projects: false,
  has_wiki: false
});

const options = {
  hostname: 'api.github.com',
  path: '/user/repos',
  method: 'POST',
  headers: {
    'Authorization': `token ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(repoData),
    'User-Agent': 'cortinas-leon-deploy'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    
    if (res.statusCode === 201) {
      console.log('✅ Repositorio creado exitosamente!');
      console.log('   URL:', result.html_url);
      console.log('   Clone URL:', result.clone_url);
      
      // Configurar remote y push
      try {
        const remoteUrl = `https://${token}@github.com/${result.full_name}.git`;
        execSync(`git remote add origin ${remoteUrl}`, { cwd: __dirname, stdio: 'pipe' });
        console.log('✅ Remote "origin" configurado');
        
        execSync('git branch -M main', { cwd: __dirname, stdio: 'inherit' });
        execSync('git push -u origin main', { cwd: __dirname, stdio: 'inherit' });
        
        console.log('\n🚀 Push completado!');
        console.log('📌 Repositorio:', result.html_url);
        console.log('\n▶️  Para deploy en Vercel:');
        console.log('   1. Ve a https://vercel.com/new');
        console.log('   2. Importa el repo: cortinas-leon');
        console.log('   3. Framework: Other (static site)');
        console.log('   4. Root Directory: ./');
        console.log('   5. Click Deploy ✅');
      } catch(e) {
        console.error('❌ Error al hacer push:', e.message);
        console.log('\nPodés hacer el push manualmente:');
        console.log(`  git remote add origin ${result.clone_url}`);
        console.log('  git branch -M main');
        console.log('  git push -u origin main');
      }
    } else if (res.statusCode === 422 && result.errors && result.errors[0]?.message?.includes('already exists')) {
      console.log('⚠️  El repositorio ya existe. Configurando remote...');
      
      // Obtener el owner del token
      const userOptions = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'cortinas-leon-deploy'
        }
      };
      
      const userReq = https.request(userOptions, (userRes) => {
        let userData = '';
        userRes.on('data', c => userData += c);
        userRes.on('end', () => {
          const user = JSON.parse(userData);
          const remoteUrl = `https://${token}@github.com/${user.login}/cortinas-leon.git`;
          try {
            try { execSync('git remote remove origin', { cwd: __dirname, stdio: 'pipe' }); } catch(e) {}
            execSync(`git remote add origin ${remoteUrl}`, { cwd: __dirname, stdio: 'pipe' });
            execSync('git branch -M main', { cwd: __dirname, stdio: 'inherit' });
            execSync('git push -u origin main --force', { cwd: __dirname, stdio: 'inherit' });
            console.log('✅ Push forzado completado!');
            console.log(`📌 https://github.com/${user.login}/cortinas-leon`);
          } catch(e) {
            console.error('❌ Error:', e.message);
          }
        });
      });
      userReq.end();
    } else {
      console.error('❌ Error al crear el repo:', res.statusCode, result.message);
      if (result.errors) console.error('Detalles:', JSON.stringify(result.errors));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de red:', e.message);
});

req.write(repoData);
req.end();
