export async function tokenizeCode(code: string) {
  try {
    const response = await fetch('http://127.0.0.1:5000/tokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}
