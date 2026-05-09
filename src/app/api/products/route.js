export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();

  // Fetch from Firebase (recommended)
  const { db } = await import("@/lib/firebase");
  const { collection, getDocs } = await import("firebase/firestore");

  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);

  let products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  if (q) {
    products = products.filter(p => 
      p.name?.toLowerCase().includes(q)
    );
  }

  return Response.json(products);
}