import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ContactSupportPage = () => {
  const handleContact = () => {
    const email = 'bhumika@example.com';
    const subject = encodeURIComponent('Account Expired - Assistance Required');
    const body = encodeURIComponent(
      'Hello Bhumika,\n\nMy account has expired and I need assistance to regain access.\n\nThank you.'
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center mb-4">Account Expired</h2>
          <p className="text-center mb-6">Your account has expired. Please contact support for assistance.</p>
          <Button onClick={handleContact} className="w-full">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSupportPage;
