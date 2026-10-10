const fs = require('fs');
const readline = require('readline');

async function extract() {
  const appDataDir = 'C:\\Users\\rashid computer\\.gemini\\antigravity\\brain\\ec95a77a-562d-47e1-993f-21cecc4af868';
  const transcriptPath = `${appDataDir}\\.system_generated\\logs\\transcript_full.jsonl`;
  
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let pdfText = '';
  let inPdf = false;
  
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content) {
        if (parsed.content.includes('==Start of PDF==')) {
           const parts = parsed.content.split('==Start of PDF==');
           if (parts.length > 1) {
             pdfText = parts[1];
           }
        }
      }
    } catch (e) {
      // ignore parsing errors for individual lines
    }
  }

  if (pdfText) {
    fs.writeFileSync('aging_report_raw.txt', pdfText);
    console.log('Extracted ' + pdfText.length + ' characters to aging_report_raw.txt');
  } else {
    console.log('Failed to find PDF text in transcript.');
  }
}

extract().catch(console.error);

