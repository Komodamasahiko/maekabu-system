'use client';

import { useEffect, useState } from 'react';

export default function TestDB() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    console.log('Testing database connection via API...');
    
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (!response.ok) {
        setError(result);
      } else {
        setData(result);
      }
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Database Connection Test</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Environment:</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify({
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            HAS_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          }, null, 2)}
        </pre>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h2>Error:</h2>
          <pre style={{ background: '#ffe0e0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>Success! Data found:</h2>
          <pre style={{ background: '#e0ffe0', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={testConnection}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          再テスト
        </button>
      </div>
    </div>
  );
}