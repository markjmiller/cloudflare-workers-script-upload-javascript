const apiToken = process.env['CLOUDFLARE_API_TOKEN'] ?? '';
if (!apiToken) {
  throw new Error('Please set envar CLOUDFLARE_ACCOUNT_ID');
}

const accountID = process.env['CLOUDFLARE_ACCOUNT_ID'] ?? '';
if (!accountID) {
  throw new Error('Please set envar CLOUDFLARE_API_TOKEN');
}

// https://blog.cloudflare.com/workers-javascript-modules/
const scriptName = "my-hello-world-script";
const scriptContent = `
export default {
  async fetch(request, env, ctx) {
    return new Response(env.MESSAGE, { status: 200 });
  }
};
`;

// https://developers.cloudflare.com/workers/configuration/multipart-upload-metadata/
const metadata = {
  main_module: `${scriptName}.mjs`,
  bindings: [
    {
      type: "plain_text",
      name: "MESSAGE",
      text: "Hello World!",
    },
  ],
  compatibility_date: "2025-06-19",
};

// With multipart/form-data, we add each file we need
// For Workers, we need "metadata" and the javascript module(s)
const formData = new FormData();
formData.append(
  "metadata",
  new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  "metadata.json"
);
formData.append(
  `${scriptName}.mjs`,
  new Blob([scriptContent], { type: "application/javascript+module" }),
  `${scriptName}.mjs`
);

fetch(
  // https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/update/
  `https://api.cloudflare.com/client/v4/accounts/${accountID}/workers/scripts/${scriptName}`,
  {
    method: "PUT",
    headers: {
      // https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
      Authorization: `Bearer ${apiToken}`,
    },
    body: formData,
  }
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Success:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
