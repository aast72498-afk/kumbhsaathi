'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';

interface UseCollectionState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T>(query: Query | null) {
  const [state, setState] = useState<UseCollectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data() as T,
          // id: doc.id, // You might want to include the doc ID
        }));
        setState({ data, loading: false, error: null });
      },
      (error) => {
        console.error(error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [query]); // Re-run effect if query changes

  return state;
}
