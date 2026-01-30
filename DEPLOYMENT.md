# 🚀 Guía de Deployment en VPS

## ⚠️ IMPORTANTE - SOLO PARA SERVIDORES SIN COOLIFY

**Si tu servidor YA TIENE Coolify instalado, NO uses esta guía.**  
**Usa:** `coolify_deployment.md` en su lugar.

Este script instala nginx, PM2, y Node.js directamente en el host, lo cual **destruirá** tu instalación de Coolify.

---

## Información del Servidor

- **IP:** 206.189.183.163
- **Usuario:** ubuntu
- **OS:** Ubuntu
- **Dominio:** somosnortex.com

---

## 📋 Pasos para Deployment

### 1️⃣ Conectar al VPS

Desde tu terminal local:

```bash
ssh ubuntu@206.189.183.163
```

### 2️⃣ Descargar el script de deployment

Una vez dentro del VPS:

```bash
wget https://raw.githubusercontent.com/Noahstark23/escuela/master/deploy.sh
chmod +x deploy.sh
```

### 3️⃣ Ejecutar el script

```bash
./deploy.sh
```

**El script hará automáticamente:**
- ✅ Actualizar el sistema
- ✅ Instalar Node.js 20
- ✅ Instalar PM2 (Process Manager)
- ✅ Instalar nginx
- ✅ Clonar el repositorio desde GitHub
- ✅ Instalar dependencias
- ✅ Configurar variables de entorno
- ✅ Crear base de datos SQLite
- ✅ Crear usuario administrador
- ✅ Compilar la aplicación
- ✅ Configurar nginx como reverse proxy
- ✅ Configurar firewall

⏱️ **Tiempo estimado:** 5-10 minutos

---

## 🌐 Acceso a la Aplicación

Después del deployment:

- **URL:** http://somosnortex.com
- **Usuario:** admin@somosnortex.com
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

---

## 🔒 Habilitar HTTPS (SSL) - OPCIONAL PERO RECOMENDADO

### Opción A: Certbot (Let's Encrypt - Gratis)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d somosnortex.com -d www.somosnortex.com
```

Certbot configurará todo automáticamente. Tu sitio estará en:
- ✅ https://somosnortex.com

### Opción B: Cloudflare (Gratis)

Si usas Cloudflare DNS:
1. Ve a tu panel de Cloudflare
2. SSL/TLS → Full (strict)
3. Activa "Always Use HTTPS"

---

## 🛠️ Comandos Útiles

### PM2 (Administrador de procesos)

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs school-erp

# Reiniciar aplicación
pm2 restart school-erp

# Detener aplicación
pm2 stop school-erp

# Iniciar aplicación
pm2 start school-erp

# Ver métricas
pm2 monit
```

### Nginx

```bash
# Reiniciar nginx
sudo systemctl restart nginx

# Ver logs de nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Test de configuración
sudo nginx -t
```

### Base de Datos

```bash
cd /home/ubuntu/school-erp

# Ver base de datos con Prisma Studio
npx prisma studio

# Reset de base de datos (⚠️ BORRA TODOS LOS DATOS)
npx prisma db push --force-reset

# Backup de base de datos
cp production.db backup-$(date +%Y%m%d).db
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en GitHub y quieras actualizarlos:

```bash
cd /home/ubuntu/school-erp

# Pull de GitHub
git pull origin master

# Reinstalar dependencias (si hay nuevas)
npm install

# Regenerar Prisma (si cambió el schema)
npx prisma generate
npx prisma db push

# Rebuild
npm run build

# Reiniciar
pm2 restart school-erp
```

O usa este script rápido:

```bash
cd /home/ubuntu/school-erp && \
git pull && \
npm install && \
npx prisma generate && \
npx prisma db push && \
npm run build && \
pm2 restart school-erp
```

---

## 🐛 Troubleshooting

### La app no carga

```bash
# Ver logs
pm2 logs school-erp --lines 100

# Verificar que está corriendo
pm2 status

# Reiniciar
pm2 restart school-erp
```

### Error de base de datos

```bash
cd /home/ubuntu/school-erp
npx prisma generate
npx prisma db push
pm2 restart school-erp
```

### Error de permisos

```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/school-erp
```

### Nginx no funciona

```bash
# Verificar configuración
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar
sudo systemctl restart nginx
```

### Puerto 80 ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :80

# Matar proceso si es necesario
sudo kill -9 <PID>
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y memoria
htop

# Disco
df -h

# Procesos de Node
ps aux | grep node
```

### Logs automáticos

PM2 guarda logs automáticamente en:
- `/home/ubuntu/.pm2/logs/school-erp-out.log`
- `/home/ubuntu/.pm2/logs/school-erp-error.log`

---

## 🔐 Seguridad

### Cambiar contraseña de admin

1. Login en http://somosnortex.com
2. Ve a Configuración
3. Cambia la contraseña

### Crear más usuarios

Usa la interfaz de "Configuración" → "Usuarios"

### Backup automático

Crea un cron job para backups diarios:

```bash
crontab -e
```

Agrega:

```
0 2 * * * cp /home/ubuntu/school-erp/production.db /home/ubuntu/backups/db-$(date +\%Y\%m\%d).db
```

---

## 📱 Configuración DNS

Asegúrate de que tu dominio apunte al VPS:

**Tipo A:**
- `somosnortex.com` → `206.189.183.163`
- `www.somosnortex.com` → `206.189.183.163`

---

## 💡 Recomendaciones Post-Deployment

1. ✅ Habilitar HTTPS con Certbot
2. ✅ Cambiar contraseña de admin
3. ✅ Configurar backups automáticos
4. ✅ Agregar empleados y estudiantes de prueba
5. ✅ Configurar categorías de transacciones
6. ✅ Probar sistema de notificaciones

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs school-erp`
2. Verifica el estado: `pm2 status`
3. Consulta la documentación de Next.js
4. Revisa el repositorio: https://github.com/Noahstark23/escuela

---

**¡Listo para producción! 🎉**
