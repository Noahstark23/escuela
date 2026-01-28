#!/bin/bash

# ========================================
# School ERP - Script de Deployment VPS
# Dominio: somosnortex.com
# ========================================

set -e  # Exit on error

echo "🚀 Iniciando deployment de School ERP..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# 1. Actualizar sistema
# ========================================
echo -e "${YELLOW}📦 Actualizando sistema...${NC}"
sudo apt update
sudo apt upgrade -y

# ========================================
# 2. Instalar Node.js 20 LTS
# ========================================
echo -e "${YELLOW}📦 Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${GREEN}✅ Node.js version:${NC}"
node -v
npm -v

# ========================================
# 3. Instalar PM2 (Process Manager)
# ========================================
echo -e "${YELLOW}📦 Instalando PM2...${NC}"
sudo npm install -g pm2

# ========================================
# 4. Instalar nginx
# ========================================
echo -e "${YELLOW}📦 Instalando nginx...${NC}"
sudo apt install -y nginx

# ========================================
# 5. Instalar Git
# ========================================
echo -e "${YELLOW}📦 Instalando Git...${NC}"
sudo apt install -y git

# ========================================
# 6. Crear directorio del proyecto
# ========================================
echo -e "${YELLOW}📁 Creando directorio del proyecto...${NC}"
cd /home/ubuntu
rm -rf school-erp  # Eliminar si existe
git clone https://github.com/Noahstark23/escuela.git school-erp
cd school-erp

# ========================================
# 7. Instalar dependencias
# ========================================
echo -e "${YELLOW}📦 Instalando dependencias de npm...${NC}"
npm install

# ========================================
# 8. Configurar variables de entorno
# ========================================
echo -e "${YELLOW}⚙️  Configurando variables de entorno...${NC}"
cat > .env << 'EOF'
DATABASE_URL=file:./production.db
NEXTAUTH_URL=http://somosnortex.com
NEXTAUTH_SECRET=7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8
CRON_SECRET=erp-school-2026-secure-cron-key-d8f3a9c2b1e7
NODE_ENV=production
EOF

# ========================================
# 9. Configurar Base de Datos
# ========================================
echo -e "${YELLOW}🗄️  Configurando base de datos...${NC}"
npx prisma generate
npx prisma db push

# Crear usuario admin inicial
echo -e "${YELLOW}👤 Creando usuario administrador...${NC}"
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@somosnortex.com' },
    update: {},
    create: {
      email: 'admin@somosnortex.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ Usuario admin creado: admin@somosnortex.com / admin123');
  await prisma.\$disconnect();
})();
"

# ========================================
# 10. Build de producción
# ========================================
echo -e "${YELLOW}🔨 Compilando aplicación...${NC}"
npm run build

# ========================================
# 11. Configurar PM2
# ========================================
echo -e "${YELLOW}⚙️  Configurando PM2...${NC}"
pm2 delete school-erp 2>/dev/null || true
pm2 start npm --name "school-erp" -- start
pm2 save
pm2 startup | tail -n 1 | sudo bash

# ========================================
# 12. Configurar nginx
# ========================================
echo -e "${YELLOW}🌐 Configurando nginx...${NC}"
sudo tee /etc/nginx/sites-available/school-erp > /dev/null << 'EOF'
server {
    listen 80;
    server_name somosnortex.com www.somosnortex.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/school-erp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test y restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# ========================================
# 13. Configurar Firewall
# ========================================
echo -e "${YELLOW}🔒 Configurando firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

# ========================================
# ✅ DEPLOYMENT COMPLETADO
# ========================================
echo -e "${GREEN}"
echo "============================================"
echo "✅ DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "============================================"
echo ""
echo "🌐 URL: http://somosnortex.com"
echo "👤 Usuario: admin@somosnortex.com"
echo "🔑 Contraseña: admin123"
echo ""
echo "📋 Comandos útiles:"
echo "  pm2 status              - Ver estado de la app"
echo "  pm2 logs school-erp     - Ver logs"
echo "  pm2 restart school-erp  - Reiniciar app"
echo "  pm2 stop school-erp     - Detener app"
echo ""
echo "🔒 Para HTTPS (SSL), ejecuta:"
echo "  sudo certbot --nginx -d somosnortex.com -d www.somosnortex.com"
echo "============================================"
echo -e "${NC}"
