const API_URL = "https://miam-miam-q5x4.onrender.com/";

export async function requestReset(email) {
  const res = await fetch(`${API_URL}api/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la demande de réinitialisation');
  }
  return res.json();
}

export async function verifyCode(email, code) {
  const res = await fetch(`${API_URL}api/password-reset/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la vérification du code');
  }
  return res.json(); // { valid: boolean }
}

export async function resetPassword(email, code, password, password_confirmation) {
  const res = await fetch(`${API_URL}api/password-reset/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password, password_confirmation }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur lors de la réinitialisation du mot de passe');
  }
  return res.json();
}
