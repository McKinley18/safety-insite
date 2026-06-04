'use client';

import { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  /* LOAD ORG */
  useEffect(() => {
    fetch(`${API}/organization`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setName(data.name || '');
          setLocations(data.locations || []);

          if (data.logoPath) {
            setLogoPreview(`${API}${data.logoPath}`);
          }
        }
      })
      .catch(() => {
        console.warn('Organization not loaded (safe fallback)');
      })
      .finally(() => setLoading(false));
  }, []);

  /* HANDLE LOGO */
  const handleLogo = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* ADD LOCATION */
  const addLocation = () => {
    if (!newLocation.trim()) return;

    setLocations([...locations, newLocation.trim()]);
    setNewLocation('');
  };

  /* REMOVE LOCATION */
  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  /* SAVE SETTINGS */
  const save = async () => {
    let logoPath = '';

    /* UPLOAD LOGO */
    if (logo) {
      const form = new FormData();
      form.append('file', logo);

      const res = await fetch(`${API}/upload/logo`, {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      logoPath = data.path;
    }

    await fetch(`${API}/organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        locations,
        logoPath,
      }),
    });

    alert('Settings saved');
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      {/* COMPANY */}
      <div style={styles.card}>
        <label style={styles.label}>Company Name</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* LOGO */}
      <div style={styles.card}>
        <label style={styles.label}>Company Logo</label>

        <input type="file" accept="image/*" onChange={handleLogo} />

        {logoPreview && (
          <img src={logoPreview} style={styles.logo} />
        )}
      </div>

      {/* LOCATIONS */}
      <div style={styles.card}>
        <label style={styles.label}>Locations</label>

        <div style={styles.row}>
          <input
            style={styles.input}
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Add location"
          />
          <button style={styles.addBtn} onClick={addLocation}>
            Add
          </button>
        </div>

        {locations.map((loc, i) => (
          <div key={i} style={styles.location}>
            {loc}
            <button onClick={() => removeLocation(i)}>✕</button>
          </div>
        ))}
      </div>

      {/* SAVE */}
      <button style={styles.save} onClick={save}>
        Save Settings
      </button>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    maxWidth: 600,
    margin: '0 auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
  },
  card: {
    background: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  label: {
    fontWeight: 600,
    display: 'block',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
  },
  row: {
    display: 'flex',
    gap: 8,
    marginBottom: 10,
  },
  addBtn: {
    background: '#2563eb',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
  },
  location: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1px solid #eee',
  },
  logo: {
    marginTop: 10,
    height: 60,
    objectFit: 'contain',
  },
  save: {
    width: '100%',
    background: '#111827',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontWeight: 600,
  },
};
