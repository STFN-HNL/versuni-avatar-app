const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    console.log("HEYGEN_API_KEY exists:", !!HEYGEN_API_KEY);
    console.log("HEYGEN_API_KEY length:", HEYGEN_API_KEY?.length);
    console.log(
      "NEXT_PUBLIC_BASE_API_URL:",
      process.env.NEXT_PUBLIC_BASE_API_URL,
    );

    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error response:", errorText);
      throw new Error(
        `API request failed with status ${res.status}: ${errorText}`,
      );
    }

    const data = await res.json();
    console.log("API Response data:", data);

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
