/**
 * Script para verificar la conexión a MongoDB
 *
 * Uso:
 *   node test-connection.js
 *
 * Este script verifica:
 * 1. Que la URI de MongoDB es válida
 * 2. Que puede conectarse a la base de datos
 * 3. Que la colección 'duplicati' existe y tiene datos
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  try {
    log('\n========================================', 'cyan');
    log('   VERIFICACIÓN DE CONEXIÓN A MONGODB', 'cyan');
    log('========================================\n', 'cyan');

    // 1. Verificar que existe la URI
    if (!MONGODB_URI) {
      log('❌ ERROR: No se encontró MONGODB_URI en .env.local', 'red');
      log('\nPor favor:', 'yellow');
      log('1. Copia .env.local.example a .env.local', 'yellow');
      log('2. Edita .env.local con tu URI de MongoDB', 'yellow');
      process.exit(1);
    }

    log('✓ URI de MongoDB encontrada', 'green');

    // Mostrar URI (ocultando la contraseña)
    const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    log(`  ${maskedUri}\n`, 'blue');

    // 2. Intentar conectar
    log('Conectando a MongoDB...', 'yellow');

    await mongoose.connect(MONGODB_URI);


    log('✓ Conexión exitosa a MongoDB Atlas\n', 'green');

    // 3. Verificar base de datos
    const dbName = mongoose.connection.db.databaseName;
    log(`Base de datos: ${dbName}`, 'blue');

    // 4. Listar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`\nColecciones encontradas:`, 'cyan');
    collections.forEach(col => {
      const mark = col.name === 'duplicati' ? '✓' : '-';
      const color = col.name === 'duplicati' ? 'green' : 'reset';
      log(`  ${mark} ${col.name}`, color);
    });

    // 5. Verificar colección 'duplicati'
    const hasDuplicati = collections.some(col => col.name === 'duplicati');

    if (!hasDuplicati) {
      log('\n⚠️  ADVERTENCIA: La colección "duplicati" no existe', 'yellow');
      log('   Será creada automáticamente al insertar el primer documento', 'yellow');
      log('   O puedes insertarla manualmente usando MongoDB Compass\n', 'yellow');
    } else {
      log('\n✓ Colección "duplicati" encontrada', 'green');

      // 6. Contar documentos
      const count = await mongoose.connection.db.collection('duplicati').countDocuments();
      log(`  Documentos en la colección: ${count}\n`, 'blue');

      if (count === 0) {
        log('⚠️  La colección está vacía', 'yellow');
        log('   Inserta datos de prueba usando MongoDB Compass', 'yellow');
        log('   Ver: MONGODB_SETUP.md para ejemplos\n', 'yellow');
      } else {
        // Mostrar un documento de ejemplo
        log('Documento de ejemplo:', 'cyan');
        const sample = await mongoose.connection.db.collection('duplicati').findOne();
        log(`  MachineName: ${sample.MachineName}`, 'blue');
        log(`  Status: ${sample.Status}`, 'blue');
        log(`  EndTime: ${sample.EndTime}`, 'blue');
        log(`  ExaminedFiles: ${sample.ExaminedFiles}\n`, 'blue');
      }
    }

    // Resumen
    log('========================================', 'cyan');
    log('   RESUMEN', 'cyan');
    log('========================================', 'cyan');
    log('✓ Conexión a MongoDB: OK', 'green');
    log(`✓ Base de datos: ${dbName}`, 'green');
    log(`${hasDuplicati ? '✓' : '⚠'} Colección "duplicati": ${hasDuplicati ? 'Existe' : 'No existe (se creará)'}`, hasDuplicati ? 'green' : 'yellow');

    if (hasDuplicati) {
      const count = await mongoose.connection.db.collection('duplicati').countDocuments();
      log(`${count > 0 ? '✓' : '⚠'} Documentos: ${count}`, count > 0 ? 'green' : 'yellow');
    }

    log('\n✅ ¡Todo listo! Puedes ejecutar "pnpm dev"\n', 'green');

  } catch (error) {
    log('\n❌ ERROR DE CONEXIÓN', 'red');
    log('========================================\n', 'red');

    if (error.name === 'MongoServerError' && error.message.includes('bad auth')) {
      log('Problema: Credenciales incorrectas', 'yellow');
      log('\nSolución:', 'cyan');
      log('1. Verifica tu usuario y contraseña en MongoDB Atlas', 'blue');
      log('2. Si la contraseña tiene caracteres especiales (@, #, etc.),', 'blue');
      log('   usa encoding en la URI:', 'blue');
      log('   Ejemplo: Mi@Pass#123 → Mi%40Pass%23123\n', 'blue');
    } else if (error.name === 'MongoNetworkError' || error.message.includes('ENOTFOUND')) {
      log('Problema: No se puede conectar al servidor', 'yellow');
      log('\nSolución:', 'cyan');
      log('1. Verifica que tu IP esté autorizada en MongoDB Atlas', 'blue');
      log('   (Network Access → Add IP Address)', 'blue');
      log('2. Para desarrollo, puedes usar 0.0.0.0/0', 'blue');
      log('3. Verifica tu conexión a internet\n', 'blue');
    } else if (error.message.includes('Invalid connection string')) {
      log('Problema: URI de MongoDB inválida', 'yellow');
      log('\nFormato correcto:', 'cyan');
      log('mongodb+srv://usuario:contraseña@cluster.mongodb.net/LTSM\n', 'blue');
    } else {
      log(`Error: ${error.message}`, 'yellow');
      log('\nRevisa:', 'cyan');
      log('1. Que la URI en .env.local sea correcta', 'blue');
      log('2. Que tu cluster esté activo en MongoDB Atlas', 'blue');
      log('3. Que tengas conexión a internet\n', 'blue');
    }

    log('Para más ayuda, consulta: MONGODB_SETUP.md\n', 'cyan');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar
testConnection();
