import { useState, useEffect } from 'react';
import * as Contacts from 'expo-contacts';
import axios from 'axios';

const BACKEND_URL = 'http://YOUR_LOCAL_IP:5000'; // Replace with your machine IP

export const useContacts = (userToken) => {
  const [syncedContacts, setSyncedContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // Extract and clean phone numbers
          const numbers = data
            .flatMap(c => c.phoneNumbers || [])
            .map(p => p.number.replace(/[^0-9+]/g, ''))
            .filter(n => n.length > 5);

          // Send to backend to find matched users
          const response = await axios.post(`${BACKEND_URL}/api/auth/sync-contacts`, 
            { numbers },
            { headers: { Authorization: `Bearer ${userToken}` }}
          );

          setSyncedContacts(response.data);
        }
      }
    } catch (error) {
      console.error('Contact sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { syncedContacts, loading, sync };
};
