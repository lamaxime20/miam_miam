export async function getOrders(defaultRows = []) {
  try {
    const raw = localStorage.getItem('app.orders') || localStorage.getItem('employer_orders');
    if (!raw) {
      localStorage.setItem('app.orders', JSON.stringify(defaultRows));
      localStorage.setItem('employer_orders', JSON.stringify(defaultRows));
      return defaultRows;
    }
    return JSON.parse(raw);
  } catch {
    return defaultRows;
  }
 }

 export async function saveOrders(rows) {
  try {
    const payload = JSON.stringify(rows);
    localStorage.setItem('app.orders', payload);
    localStorage.setItem('employer_orders', payload);
    return true;
  } catch {
    return false;
  }
 }

 export async function getMenuEditable(defaultRows = []) {
  try {
    const raw = localStorage.getItem('app.menu');
    if (!raw) {
      localStorage.setItem('app.menu', JSON.stringify(defaultRows));
      return defaultRows;
    }
    return JSON.parse(raw);
  } catch {
    return defaultRows;
  }
 }

 export async function saveMenuEditable(rows) {
  try {
    localStorage.setItem('app.menu', JSON.stringify(rows));
    return true;
  } catch {
    return false;
  }
 }

 export async function getComplaints(defaultRows = []) {
  try {
    const raw = localStorage.getItem('app.complaints');
    if (!raw) {
      localStorage.setItem('app.complaints', JSON.stringify(defaultRows));
      return defaultRows;
    }
    return JSON.parse(raw);
  } catch {
    return defaultRows;
  }
 }

 export async function saveComplaints(rows) {
  try {
    localStorage.setItem('app.complaints', JSON.stringify(rows));
    return true;
  } catch {
    return false;
  }
 }
