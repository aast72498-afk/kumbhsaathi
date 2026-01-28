'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

interface UseDocState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T>(ref: DocumentReference | null) {
  const [state, setState] = useState<UseDocState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          const data = {
            ...doc.data() as T,
            // id: doc.id, // You might want to include the doc ID
          };
          setState({ data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: new Error("Document does not exist") });
        }
      },
      (error) => {
        console.error(error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [ref]); // Re-run effect if ref changes

  return state;
}
