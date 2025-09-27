const XLSX = require('xlsx');
const fs = require('fs');

// Читаем Excel файл
const workbook = XLSX.readFile('./ЦОДД.xlsx');

console.log('Листы в файле:', workbook.SheetNames);

// Анализируем каждый лист
workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`\n=== Лист ${index + 1}: ${sheetName} ===`);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length > 0) {
    console.log('Заголовки:', jsonData[0]);
    console.log('Количество строк:', jsonData.length - 1);
    
    // Показываем первые несколько строк данных
    if (jsonData.length > 1) {
      console.log('Первые 3 строки данных:');
      for (let i = 1; i <= Math.min(4, jsonData.length - 1); i++) {
        console.log(`Строка ${i}:`, jsonData[i]);
      }
    }
  }
});

// Сохраняем данные в JSON для дальнейшего анализа
const allData = {};
workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  allData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
});

fs.writeFileSync('./excel-data.json', JSON.stringify(allData, null, 2), 'utf8');
console.log('\nДанные сохранены в excel-data.json');