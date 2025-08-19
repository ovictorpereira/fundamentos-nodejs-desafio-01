import fs from "node:fs";
import { parse } from "csv-parse";

const seedCsv = new URL("seed.csv", import.meta.url);

const csvParse = parse({
  fromLine: 2,
});

const request = async (title, description) => {
  const response = await fetch("http://localhost:3333/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
    }),
  });

  return { title, description, status: response.status };
};

const processFile = async () => {
  const records = [];
  const failedResponses = [];
  const parser = fs.createReadStream(seedCsv).pipe(csvParse);

  for await (const record of parser) {
    const [title, description] = record;
    const reqResponse = await request(title, description);
    if (reqResponse.status !== 201) {
      failedResponses.push(reqResponse);
    }
    records.push(record);
  }

  return { records, failedResponses };
};

const result = await processFile();
console.log(`linhas processadas: ${result.records.length}`);
console.log(`linhas com falha: ${result.failedResponses.length}`);
