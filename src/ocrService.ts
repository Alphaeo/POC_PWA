const DOCINTEL_ENDPOINT = import.meta.env.VITE_DOCINTEL_ENDPOINT;
const DOCINTEL_KEY = import.meta.env.VITE_DOCINTEL_KEY;

export interface OcrResult {
  merchantName?: string;
  date?: string;
  total?: number;
}

export const analyzeReceipt = async (file: File): Promise<OcrResult> => {
  const arrayBuffer = await file.arrayBuffer();

  const analyzeResponse = await fetch(
    `${DOCINTEL_ENDPOINT}documentintelligence/documentModels/prebuilt-receipt:analyze?api-version=2024-02-29-preview`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": DOCINTEL_KEY,
        "Content-Type": file.type,
      },
      body: arrayBuffer,
    }
  );

  if (!analyzeResponse.ok) {
    throw new Error(`OCR erreur: ${analyzeResponse.status}`);
  }

  const operationLocation = analyzeResponse.headers.get("Operation-Location");
  if (!operationLocation) throw new Error("Pas d'operation-location");

  // Polling jusqu'à ce que l'analyse soit terminée
  let result: any = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollResponse = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": DOCINTEL_KEY },
    });
    const pollData = await pollResponse.json();
    if (pollData.status === "succeeded") {
      result = pollData;
      break;
    }
  }

  if (!result) throw new Error("OCR timeout");

  const doc = result.analyzeResult?.documents?.[0];
  const fields = doc?.fields;

  return {
    merchantName: fields?.MerchantName?.valueString,
    date: fields?.TransactionDate?.valueDate,
    total: fields?.Total?.valueCurrency?.amount,
  };
};