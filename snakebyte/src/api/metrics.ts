function getUTMParameters() {
  var params = {};
  var queryString = window.location.search.substring(1); // Get query string, excluding '?'
  var queryParams = queryString.split("&"); // Split parameters
  queryParams.forEach(function (param) {
    var pair = param.split("="); // Split key-value pairs
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1] || "");
    // Check if the parameter is a UTM parameter
    // @ts-ignore
    params[key] = value; // Store UTM parameters in an object
  });
  const param =
    Object.values(params).length && (Object.values(params)[0] as string).length
      ? (Object.values(params)[0] as string)
      : "direct";
  return param;
}

async function captureAndHashBrowserDetails(canvasFingerprint: string) {
  console.log(getUTMParameters());
  // Capture browser details
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const devicePixelRatio = window.devicePixelRatio;
  // Combine the details
  const combinedDetails = `${userAgent}|${language}|${devicePixelRatio}|${canvasFingerprint}`;

  // Convert the combined string to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedDetails);

  // Hash the combined details using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert the hash to a hexadecimal string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function postPageView(canvasFingerprint: string) {
  const hash = await captureAndHashBrowserDetails(canvasFingerprint);
  return (await (
    await fetch(
      "https://airbyte-snake-backend-JacobPrall.replit.app/page_views",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_utm: getUTMParameters(),
          player_id: hash,
        }),
      }
    )
  ).json()) as [string, number][];
}

export async function postPlay(canvasFingerprint: string) {
  const hash = await captureAndHashBrowserDetails(canvasFingerprint);
  return (await (
    await fetch("https://airbyte-snake-backend-JacobPrall.replit.app/plays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_utm: getUTMParameters(),
        player_id: hash,
      }),
    })
  ).json()) as [string, number][];
}
