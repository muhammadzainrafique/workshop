require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/ask', async (req, res) => {
  console.log('i am called');
  const prompt = req.body.prompt;

  const client = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const input = {
    modelId: "anthropic.claude-v2",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 300,
      temperature: 0.5,
      top_k: 250,
      top_p: 1,
      stop_sequences: ["\n\nHuman:"],
      anthropic_version: "bedrock-2023-05-31"
    }),
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString('utf8'));
    res.json({ reply: result.completion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI failed to respond' });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
