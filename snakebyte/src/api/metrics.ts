function getUTMParameters() {
  var params = {};
  var queryString = window.location.search.substring(1); // Get query string, excluding '?'
  var queryParams = queryString.split("&"); // Split parameters
  queryParams.forEach(function (param) {
    var pair = param.split("="); // Split key-value pairs
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1] || "");
    if (key.startsWith("utm_")) {
      // Check if the parameter is a UTM parameter
      // @ts-ignore
      params[key] = value; // Store UTM parameters in an object
    }
  });
  return params as { [key: string]: string };
}

export async function postPageView() {
  return (await (
    await fetch(
      "https://airbyte-snake-backend-JacobPrall.replit.app/page_views",
      {
        method: "POST",
        body: JSON.stringify({
          page_utm: getUTMParameters()?.utm_source ?? "utm_direct",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  ).json()) as [string, number][];
}

export async function postPlay() {
  return (await (
    await fetch("https://airbyte-snake-backend-JacobPrall.replit.app/plays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
  ).json()) as [string, number][];
}
