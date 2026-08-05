const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'ideaVaultData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We find the line containing "Rút" and the start of getSeededRng, and replace it.
const targetPattern = /"Rút ti[\s\S]*?function getSeededRng/;
if (targetPattern.test(content)) {
  console.log("Found corrupted pattern!");
  content = content.replace(targetPattern, `"Rút tiền mặt định mức từ thẻ tín dụng để xử lý việc khẩn cấp"
  ]
};

// Helper function for 32-bit seeded pseudo-random generation
function getSeededRng`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully fixed the file!");
} else {
  console.log("Pattern not found!");
}
