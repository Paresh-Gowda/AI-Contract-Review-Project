const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const uploadedFiles = [];

const fallbackSummaries = {
"Sale Deed Format.docx": `
1. This document is a Sale Deed agreement between Vendor and Purchaser.
2. It outlines the property sale and terms agreed.
3. The Vendor confirms clear ownership of the property.
4. Sale consideration and payment terms are specified.
5. Purchaser will accept possession upon payment completion.
6. Clauses govern title transfer and possession rights.
7. Both parties agree to all listed terms and conditions.
8. Provisions address disputes and liabilities.
9. The deed execution date is specified with witnesses.
10. This contract protects rights of both parties involved.
---
# Legal References and Proof Links:
- [Sale Deed Landmark Supreme Court Judgement](https://indiankanoon.org/doc/17702659/)
- [Ownership over property in sale deed case](https://www.livelaw.in/supreme-court/ownership-over-property-cant-be-claimed-when-sale-deed-is-executed-by-person-having-no-title-supreme-court-250991)
- [Top 5 Real Estate Supreme Court Landmark Judgments](https://www.indialaw.in/blog/real-estate/top-5-real-estate-supreme-court-landmark-judgments-2023/)
---`
};

app.post('/upload', upload.single('contract'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  uploadedFiles.push({
    originalName: req.file.originalname,
    path: req.file.path,
    uploadTime: new Date(),
  });

  res.json({ message: 'File uploaded successfully', originalName: req.file.originalname });
});

app.get('/contracts', (req, res) => {
  res.json(uploadedFiles);
});

app.post('/analyze', async (req, res) => {
  const { contractText, originalName } = req.body;

  try {
    const prompt = `Analyze this contract text:\n${contractText}\nProvide summary with legal risks and references.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ analysis: completion.choices[0].message.content });

  } catch (err) {
    console.error('OpenAI API failed, returning fallback:', err);

    if (originalName && fallbackSummaries[originalName]) {
      return res.json({ analysis: fallbackSummaries[originalName], warning: 'Using fallback summary due to API failure.' });
    }

    res.status(500).json({ error: 'AI analysis failed and no fallback available' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
