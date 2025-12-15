// fix-imports.js
// Ejecuta: node fix-imports.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Función para obtener todos los archivos .jsx y .js recursivamente
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Función para corregir imports en un archivo
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Reemplazar Components por components
  if (content.includes('../Components') || content.includes('./Components')) {
    content = content.replace(/(['"])\.\.\/Components/g, '$1../components');
    content = content.replace(/(['"])\.\/Components/g, '$1./components');
    changed = true;
  }
  
  // Reemplazar Pages por pages
  if (content.includes('../Pages') || content.includes('./Pages')) {
    content = content.replace(/(['"])\.\.\/Pages/g, '$1../pages');
    content = content.replace(/(['"])\.\/Pages/g, '$1./pages');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Corregido: ${filePath}`);
    return true;
  }
  
  return false;
}

// Ejecutar
console.log('🔍 Buscando archivos con imports inconsistentes...\n');

const allFiles = getAllFiles(srcDir);
let fixedCount = 0;

allFiles.forEach(file => {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Proceso completado: ${fixedCount} archivos corregidos`);

if (fixedCount === 0) {
  console.log('ℹ️  No se encontraron imports para corregir');
}